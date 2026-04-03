import { Op } from "sequelize";
import InstruksiGubernur from "../models/InstruksiGubernur.js";
import PengajuanKeGubernur from "../models/PengajuanKeGubernur.js";
import Task from "../models/Task.js";
import TaskAssignment from "../models/TaskAssignment.js";
import TaskLog from "../models/TaskLog.js";
import ClarificationThread from "../models/ClarificationThread.js";
import ClarificationMessage from "../models/ClarificationMessage.js";
import ExecutionThreadEvent from "../models/ExecutionThreadEvent.js";
import HorizontalCoordinationRequest from "../models/HorizontalCoordinationRequest.js";
import { fetchOperationalRowsForThread } from "./executionThreadOperationalQuery.js";
import {
  assigneeRoleToOrgLevel,
  unitKerjaToOrgLevel,
  inferOperationalMarker,
} from "./executionThreadOrgLevelUtils.js";
import { isHCoordTerminalStatus } from "./horizontalCoordinationStateMachine.js";

if (!Task.associations?.assignments) {
  Task.hasMany(TaskAssignment, { foreignKey: "task_id", as: "assignments" });
}

function pushEv(list, at, sortKey, entry) {
  const ts = at ? new Date(at).getTime() : 0;
  list.push({ _ts: ts, _sk: sortKey, ...entry });
}

function firstAssignOrg(assignments) {
  const a = assignments?.[0];
  return a?.assignee_role ? assigneeRoleToOrgLevel(a.assignee_role) : "pelaksana";
}

function taskMarker(status) {
  const s = String(status || "").toLowerCase();
  if (s === "closed" || s === "verified" || s === "approved_by_secretary") return "selesai";
  if (s === "escalated") return "eskalasi";
  if (s === "rejected") return "ditolak";
  return "sedang_diproses";
}

function clarOrgLevel(lane) {
  const l = String(lane || "").toLowerCase();
  if (l.includes("sek") || l === "hub") return "sekretaris";
  if (l.includes("kabid") || l.includes("bidang")) return "kabid";
  return "sekretaris";
}

function horizontalOrgLevel(fromLevel) {
  const l = String(fromLevel || "").toLowerCase();
  if (["gubernur", "kadis", "sekretaris", "kabid", "uptd", "pelaksana", "operasional"].includes(l)) {
    return l;
  }
  return "kabid";
}

function horizontalMarker(status, slaDueAt) {
  const s = String(status || "").toLowerCase();
  if (isHCoordTerminalStatus(s)) {
    if (s === "gagal_koordinasi" || s === "ditolak") return "eskalasi";
    return "selesai";
  }
  if (s === "terlambat") return "eskalasi";
  if (slaDueAt && new Date(slaDueAt).getTime() < Date.now()) return "eskalasi";
  return "sedang_diproses";
}

function severityRankFromPolicyPayload(payload) {
  const s = String(payload?.severity || "").toLowerCase();
  if (s === "high" || s === "critical" || s === "kritis") return 2;
  if (s === "warning" || s === "medium" || s === "sedang" || s === "tinggi") return 1;
  return 0;
}

/**
 * Kurangi spam policy_rule_logged: kritis tampil utuh (dedupe key), peringatan top-2, info digulung.
 */
function mergePolicyTimelineEvents(events) {
  const rest = [];
  const policies = [];
  for (const e of events) {
    if (e.activity === "policy_rule_logged") policies.push(e);
    else rest.push(e);
  }
  if (!policies.length) return events;

  policies.sort((a, b) => {
    const dr = severityRankFromPolicyPayload(b.payload) - severityRankFromPolicyPayload(a.payload);
    if (dr) return dr;
    return (a._ts || 0) - (b._ts || 0);
  });

  const kept = [];
  const seen = new Set();

  for (const p of policies) {
    const rank = severityRankFromPolicyPayload(p.payload);
    const key = String(p.payload?.policy_key || p.ref_id || "");
    if (rank >= 2) {
      if (key && seen.has(`h:${key}`)) continue;
      if (key) seen.add(`h:${key}`);
      kept.push({
        ...p,
        summary: p.payload?.label || p.payload?.reason || p.summary,
        marker: "policy_kritis",
      });
    }
  }

  let wCount = 0;
  for (const p of policies) {
    const rank = severityRankFromPolicyPayload(p.payload);
    if (rank !== 1) continue;
    const key = String(p.payload?.policy_key || p.ref_id || "");
    if (key && seen.has(`w:${key}`)) continue;
    if (wCount >= 2) break;
    if (key) seen.add(`w:${key}`);
    wCount += 1;
    kept.push({
      ...p,
      summary: p.payload?.label || p.payload?.reason || p.summary,
      marker: "policy_peringatan",
    });
  }

  const low = policies.filter((p) => severityRankFromPolicyPayload(p.payload) === 0);
  if (low.length) {
    const keys = [...new Set(low.map((p) => String(p.payload?.policy_key || p.ref_id || "")))].filter(
      Boolean,
    );
    const maxTs = Math.max(...low.map((p) => p._ts || 0), 0);
    kept.push({
      kind: "thread_event",
      activity: "policy_rule_logged_summary",
      modul: "policy_engine",
      ref_id: "rollup",
      summary: `${low.length} indikator kebijakan ringan (diringkas)`,
      org_level: "lainnya",
      marker: "policy_ringkas",
      payload: {
        count: low.length,
        policy_keys: keys.slice(0, 12),
        thread_health_snapshot: low[low.length - 1]?.payload?.thread_health_snapshot,
      },
      _ts: maxTs,
      _sk: "policy-rollup",
    });
  }

  return [...rest, ...kept];
}

/**
 * Timeline terurut: instruksi, tugas, log tugas, pengajuan, klarifikasi, event thread.
 */
export async function buildExecutionThreadTimeline(threadId) {
  const t = String(threadId);
  const events = [];

  const instrRows = await InstruksiGubernur.findAll({
    where: { execution_thread_id: t },
    order: [["created_at", "ASC"]],
  });
  for (const ig of instrRows) {
    const j = ig.toJSON();
    pushEv(events, j.created_at, `ig-c-${j.id}`, {
      kind: "instruksi",
      activity: "instruksi_created",
      modul: "instruksi_gubernur",
      ref_id: j.id,
      summary: j.judul,
      status: j.status,
      org_level: "gubernur",
      marker: ["selesai", "draf"].includes(String(j.status || "")) ? "selesai" : "sedang_diproses",
      payload: {
        nomor_instruksi: j.nomor_instruksi,
        prioritas: j.prioritas,
        deadline: j.deadline,
      },
    });
    if (j.laporan_pelaksanaan) {
      pushEv(events, j.selesai_at || j.updated_at, `ig-lap-${j.id}`, {
        kind: "laporan",
        activity: "laporan_pelaksanaan_instruksi",
        modul: "instruksi_gubernur",
        ref_id: j.id,
        summary: "Laporan pelaksanaan instruksi",
        org_level: "kadis",
        marker: "selesai",
        payload: { excerpt: String(j.laporan_pelaksanaan).slice(0, 500) },
      });
    }
  }

  const tasks = await Task.findAll({
    where: { execution_thread_id: t },
    include: [{ model: TaskAssignment, as: "assignments", required: false }],
    order: [["created_at", "ASC"]],
  });

  for (const task of tasks) {
    const j = task.toJSON();
    pushEv(events, j.created_at, `task-c-${j.id}`, {
      kind: "task",
      activity: "task_created",
      modul: "task",
      ref_id: j.id,
      summary: j.title,
      status: j.status,
      org_level: firstAssignOrg(j.assignments),
      marker: taskMarker(j.status),
      payload: {
        module: j.module,
        source_unit: j.source_unit,
        sumber_perintah_kadin: j.sumber_perintah_kadin,
        assignments: (j.assignments || []).map((a) => ({
          assignee_role: a.assignee_role,
          assignee_user_id: a.assignee_user_id,
          status: a.status,
        })),
      },
    });
    pushEv(events, j.updated_at, `task-u-${j.id}`, {
      kind: "task",
      activity: "task_snapshot",
      modul: "task",
      ref_id: j.id,
      summary: `Pembaruan tugas: ${j.title}`,
      status: j.status,
      org_level: firstAssignOrg(j.assignments),
      marker: taskMarker(j.status),
      payload: { updated_at: j.updated_at },
    });
  }

  const taskIds = tasks.map((x) => x.id);
  if (taskIds.length) {
    const logs = await TaskLog.findAll({
      where: { task_id: { [Op.in]: taskIds } },
      order: [["created_at", "ASC"]],
    });
    for (const log of logs) {
      const j = log.toJSON();
      pushEv(events, j.created_at, `log-${j.id}`, {
        kind: "task_log",
        activity: j.action,
        modul: "task_log",
        ref_id: j.id,
        summary: j.note || j.action,
        org_level: "pelaksana",
        marker: "sedang_diproses",
        payload: {
          task_id: j.task_id,
          actor_id: j.actor_id,
        },
      });
    }
  }

  const pengRows = await PengajuanKeGubernur.findAll({
    where: { execution_thread_id: t },
    order: [["created_at", "ASC"]],
  });
  for (const p of pengRows) {
    const j = p.toJSON();
    pushEv(events, j.created_at, `peng-${j.id}`, {
      kind: "pengajuan",
      activity: "pengajuan_created",
      modul: "pengajuan_ke_gubernur",
      ref_id: j.id,
      summary: j.judul,
      status: j.status,
      org_level: "gubernur",
      marker: "sedang_diproses",
      payload: { nomor_pengajuan: j.nomor_pengajuan, jenis: j.jenis },
    });
    if (j.diputuskan_at) {
      pushEv(events, j.diputuskan_at, `peng-d-${j.id}`, {
        kind: "pengajuan",
        activity: "pengajuan_diputuskan",
        modul: "pengajuan_ke_gubernur",
        ref_id: j.id,
        summary: `Keputusan: ${j.status}`,
        status: j.status,
        org_level: "gubernur",
        marker: "selesai",
        payload: {
          diputuskan_oleh: j.diputuskan_oleh,
          catatan_gubernur: j.catatan_gubernur
            ? String(j.catatan_gubernur).slice(0, 400)
            : null,
        },
      });
    }
  }

  const clarThreads = await ClarificationThread.findAll({
    where: { execution_thread_id: t },
    order: [["created_at", "ASC"]],
  });
  for (const th of clarThreads) {
    const j = th.toJSON();
    pushEv(events, j.created_at, `clt-${j.id}`, {
      kind: "klarifikasi",
      activity: "clarification_thread",
      modul: "clarification_threads",
      ref_id: j.id,
      summary: j.subject || `Thread ${j.lane}`,
      org_level: clarOrgLevel(j.lane),
      marker: "klarifikasi",
      payload: {
        anchor_type: j.anchor_type,
        anchor_id: j.anchor_id,
        lane: j.lane,
      },
    });

    const msgs = await ClarificationMessage.findAll({
      where: { thread_id: j.id },
      order: [["created_at", "ASC"]],
      limit: 500,
    });
    for (const m of msgs) {
      const mj = m.toJSON();
      pushEv(events, mj.created_at, `clm-${mj.id}`, {
        kind: "klarifikasi",
        activity: "clarification_message",
        modul: "clarification_messages",
        ref_id: mj.id,
        summary: String(mj.body || "").slice(0, 120),
        org_level: clarOrgLevel(j.lane),
        marker: "klarifikasi",
        payload: { thread_id: mj.thread_id, author_id: mj.author_id },
      });
    }
  }

  const ext = await ExecutionThreadEvent.findAll({
    where: { execution_thread_id: t },
    order: [["created_at", "ASC"]],
    limit: 500,
  });
  for (const e of ext) {
    const j = e.toJSON();
    pushEv(events, j.created_at, `ev-${j.id}`, {
      kind: "thread_event",
      activity: j.event_type,
      modul: j.ref_modul || "execution_thread_events",
      ref_id: j.ref_id,
      summary: j.event_type,
      org_level: "lainnya",
      marker: "sistem",
      payload: j.payload,
    });
  }

  const hcoordRows = await HorizontalCoordinationRequest.findAll({
    where: { execution_thread_id: t },
    order: [["created_at", "ASC"]],
    limit: 300,
  });
  for (const h of hcoordRows) {
    const j = h.toJSON();
    const org = horizontalOrgLevel(j.from_org_level);
    pushEv(events, j.created_at, `hc-${j.id}`, {
      kind: "koordinasi_horizontal",
      activity: "horizontal_coordination_item",
      modul: "horizontal_coordination_requests",
      ref_id: j.id,
      summary: j.subject || `Koordinasi · ${j.coordination_kind || "sync"}`,
      status: j.status,
      org_level: org,
      marker: horizontalMarker(j.status, j.sla_due_at),
      payload: {
        coordination_kind: j.coordination_kind,
        from_unit: j.from_unit,
        to_unit: j.to_unit,
        to_user_id: j.to_user_id,
        sla_due_at: j.sla_due_at,
      },
    });
    if (j.responded_at) {
      pushEv(events, j.responded_at, `hcr-${j.id}`, {
        kind: "koordinasi_horizontal",
        activity: "horizontal_coordination_responded",
        modul: "horizontal_coordination_requests",
        ref_id: j.id,
        summary: "Balasan koordinasi horizontal",
        status: j.status,
        org_level: org,
        marker: "selesai",
        payload: {
          excerpt: j.response_body ? String(j.response_body).slice(0, 240) : null,
        },
      });
    }
  }

  const opRows = await fetchOperationalRowsForThread(t);
  for (const row of opRows) {
    const uk = unitKerjaToOrgLevel(row.unit_kerja);
    pushEv(events, row.created_at, `op-${row.src_table}-${row.id}`, {
      kind: "operasional",
      activity: "laporan_operasional",
      modul: row.src_table,
      ref_id: row.id,
      summary: `${row.src_table.replace(/_/g, " ")} · ${row.status || "—"}`,
      status: row.status,
      org_level: uk === "operasional" ? "operasional" : uk,
      marker: inferOperationalMarker(row.status),
      payload: {
        task_id: row.task_id,
        unit_kerja: row.unit_kerja,
        table: row.src_table,
      },
    });
    if (row.updated_at && String(row.updated_at) !== String(row.created_at)) {
      pushEv(events, row.updated_at, `opu-${row.src_table}-${row.id}`, {
        kind: "operasional",
        activity: "operational_update",
        modul: row.src_table,
        ref_id: row.id,
        summary: `Pembaruan data ${row.src_table}`,
        status: row.status,
        org_level: uk === "operasional" ? "operasional" : uk,
        marker: inferOperationalMarker(row.status),
        payload: { task_id: row.task_id, unit_kerja: row.unit_kerja },
      });
    }
  }

  const merged = mergePolicyTimelineEvents(events);
  merged.sort((a, b) => {
    if (a._ts !== b._ts) return a._ts - b._ts;
    return String(a._sk).localeCompare(String(b._sk));
  });

  return merged.map(({ _ts, _sk, ...rest }) => ({
    ...rest,
    occurred_at: _ts ? new Date(_ts).toISOString() : null,
    sort_key: _sk,
  }));
}
