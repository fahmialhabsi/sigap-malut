import { Op } from "sequelize";
import ExecutionThreadEvent from "../models/ExecutionThreadEvent.js";
import HorizontalCoordinationRequest from "../models/HorizontalCoordinationRequest.js";
import InstruksiGubernur from "../models/InstruksiGubernur.js";
import Task from "../models/Task.js";
import { evaluatePolicyRules } from "./policyEngineService.js";
import { buildExecutionThreadCockpit } from "./executionThreadCockpitService.js";
import { buildMachineAssistedDecisionForThread } from "./machineAssistedDecisionService.js";
import { buildPredictiveCoordinationSnapshot } from "./predictiveCoordinationService.js";

const EVENT_TYPE = "policy_rule_logged";
/** Satu policy_key per thread tidak ditulis ulang dalam jendela ini (jam). */
const DEDUPE_HOURS = Math.max(1, Number(process.env.POLICY_LOG_DEDUPE_HOURS || 12));
const MAX_THREADS_PER_RUN = Math.max(50, Math.min(800, Number(process.env.POLICY_LOG_MAX_THREADS || 400)));

function recommendedActionForRule(ruleId) {
  const m = {
    policy_thread_health_critical: "Review thread di halaman fokus; kumpulkan fakta sebelum keputusan.",
    policy_thread_health_warning: "Pantau timeline dan koordinasi horizontal terkait thread.",
    policy_sla_breach_open: "Tindak lanjut tugas terbuka yang lewat SLA atau eskalasi ke atasan.",
    policy_horizontal_coord_overdue: "Ingatkan unit penerima koordinasi horizontal atau ubah prioritas.",
    policy_decision_intervensi: "Pertimbangkan arahan pimpinan atau rapat koordinasi singkat.",
  };
  return m[ruleId] || "Tinjau thread dan dokumentasi kebijakan terkait.";
}

function targetRoleForRule(ruleId) {
  const m = {
    policy_thread_health_critical: "kadis_sekretaris",
    policy_thread_health_warning: "sekretaris_kabid",
    policy_sla_breach_open: "kabid_pelaksana",
    policy_horizontal_coord_overdue: "sekretaris_kabid",
    policy_decision_intervensi: "kadis_gubernur",
  };
  return m[ruleId] || "thread_owner";
}

function targetUnitForContext(ctx) {
  if (Number(ctx.horizontal_sla_overdue || 0) > 0) return "unit_penerima_koordinasi";
  if (Number(ctx.sla_breach_open_tasks || 0) > 0) return "unit_penanggung_tugas";
  return null;
}

async function wasRuleLoggedRecently(threadId, ruleId) {
  const since = new Date(Date.now() - DEDUPE_HOURS * 3600000);
  const n = await ExecutionThreadEvent.count({
    where: {
      execution_thread_id: String(threadId),
      event_type: EVENT_TYPE,
      ref_modul: "policy_engine",
      ref_id: String(ruleId),
      created_at: { [Op.gte]: since },
    },
  });
  return n > 0;
}

async function collectCandidateThreadIds() {
  const set = new Set();
  const addFromModel = async (Model, extraWhere = {}) => {
    const rows = await Model.findAll({
      attributes: ["execution_thread_id"],
      where: { execution_thread_id: { [Op.ne]: null }, ...extraWhere },
      raw: true,
      limit: 400,
    });
    for (const r of rows) {
      const tid = r.execution_thread_id;
      if (tid && String(tid).length >= 32) set.add(String(tid));
    }
  };

  await addFromModel(HorizontalCoordinationRequest);
  await addFromModel(InstruksiGubernur);
  await addFromModel(Task);

  return [...set].slice(0, MAX_THREADS_PER_RUN);
}

/**
 * Evaluasi policy untuk satu thread dan persist ke execution_thread_events (dengan dedupe per jendela waktu).
 */
export async function persistPolicyEvaluationsForThread(threadId) {
  const tid = String(threadId);
  const [cockpit, decision, predictive] = await Promise.all([
    buildExecutionThreadCockpit(tid),
    buildMachineAssistedDecisionForThread(tid),
    buildPredictiveCoordinationSnapshot(tid),
  ]);

  const ctx = {
    health_status: cockpit.thread_health?.status,
    sla_breach_open_tasks: decision.signals?.sla_breach_open_tasks,
    horizontal_sla_overdue: predictive.horizontal_sla_overdue,
    decision_score: decision.decision_score,
  };

  const { flags, version } = evaluatePolicyRules(ctx);
  let written = 0;
  const skipped = [];

  for (const f of flags) {
    if (!f?.id) continue;
    if (await wasRuleLoggedRecently(tid, f.id)) {
      skipped.push(f.id);
      continue;
    }
    const threadHealthSnapshot = {
      health_status: ctx.health_status,
      decision_score: ctx.decision_score,
      open_horizontal: predictive.open_horizontal_items,
      horizontal_sla_overdue: predictive.horizontal_sla_overdue,
      coordination_delay_risk: predictive.coordination_delay_risk,
    };
    await ExecutionThreadEvent.create({
      execution_thread_id: tid,
      event_type: EVENT_TYPE,
      ref_modul: "policy_engine",
      ref_id: String(f.id),
      payload: {
        policy_key: f.id,
        policy_version: version,
        severity: f.severity,
        label: f.label,
        reason: f.label,
        recommended_action: recommendedActionForRule(f.id),
        target_role: targetRoleForRule(f.id),
        target_unit: targetUnitForContext(ctx),
        thread_health_snapshot: threadHealthSnapshot,
        triggered_at: new Date().toISOString(),
        actor: "policy_engine",
        target_entity: "execution_thread",
        context_snapshot: {
          health_status: ctx.health_status,
          decision_score: ctx.decision_score,
          open_horizontal: predictive.open_horizontal_items,
          horizontal_sla_overdue: predictive.horizontal_sla_overdue,
        },
      },
      actor_id: null,
      created_at: new Date(),
    });
    written += 1;
  }

  return { thread_id: tid, rules_evaluated: flags.length, events_written: written, skipped_dedupe: skipped };
}

/**
 * Batch job: pindai kumpulan thread kandidat, tanpa memanggil dari GET detail thread.
 */
export async function runPolicyExecutionLogJob() {
  const ids = await collectCandidateThreadIds();
  const results = { threads_scanned: ids.length, events_written: 0, errors: [] };
  for (const id of ids) {
    try {
      const r = await persistPolicyEvaluationsForThread(id);
      results.events_written += r.events_written;
    } catch (e) {
      results.errors.push({ thread_id: id, message: e?.message || String(e) });
    }
  }
  return results;
}

export { EVENT_TYPE as POLICY_LOG_EVENT_TYPE, DEDUPE_HOURS as POLICY_LOG_DEDUPE_HOURS };
