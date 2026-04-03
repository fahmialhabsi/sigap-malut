import { Op } from "sequelize";
import HorizontalCoordinationRequest from "../models/HorizontalCoordinationRequest.js";
import { userCanAccessExecutionThread } from "../services/executionThreadAccessService.js";
import { buildExecutionThreadTimeline } from "../services/executionThreadTimelineService.js";
import { buildExtendedHierarchicalKpiForThread } from "../services/executionThreadKpiService.js";
import { buildExecutionHubForUser } from "../services/executionThreadHubService.js";
import { buildExecutionThreadCockpit } from "../services/executionThreadCockpitService.js";
import { buildHierarchyKpiRollupForUser } from "../services/executionThreadRollupService.js";
import { buildCrossThreadAnalyticsSnapshot } from "../services/executionThreadCrossAnalyticsService.js";
import { buildMachineAssistedDecisionForThread } from "../services/machineAssistedDecisionService.js";
import { buildPredictiveCoordinationSnapshot } from "../services/predictiveCoordinationService.js";
import { buildActionAutomationSuggestions } from "../services/actionAutomationService.js";
import { evaluatePolicyRules } from "../services/policyEngineService.js";
import {
  filterExecutionThreadTimeline,
  buildTimelineNavigationMeta,
} from "../services/executionThreadTimelineFilterService.js";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getExecutionThreadDetail(req, res) {
  try {
    const id = String(req.params.id || "").trim();
    if (!id || !UUID_RE.test(id)) {
      return res.status(400).json({
        success: false,
        message: "execution_thread_id tidak valid (UUID).",
      });
    }
    const ok = await userCanAccessExecutionThread(req.user, id);
    if (!ok) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak untuk thread eksekusi ini.",
      });
    }
    const compact =
      req.query.compact === "1" ||
      req.query.mode === "ringkas" ||
      req.query.ringkas === "1";

    const q = req.query || {};
    const timelineFull = await buildExecutionThreadTimeline(id);
    const timelineFiltered = filterExecutionThreadTimeline(timelineFull, q);
    const timelineOut = compact ? timelineFiltered.slice(-40) : timelineFiltered;

    const [horizontalOpen, kpi_hierarki, cockpit, decision_engine, predictive] = await Promise.all([
      HorizontalCoordinationRequest.count({
        where: {
          execution_thread_id: id,
          status: { [Op.notIn]: ["selesai", "dibatalkan", "ditolak"] },
        },
      }),
      buildExtendedHierarchicalKpiForThread(id),
      buildExecutionThreadCockpit(id, { timeline: timelineFull }),
      buildMachineAssistedDecisionForThread(id),
      buildPredictiveCoordinationSnapshot(id),
    ]);

    const policyCtx = {
      health_status: cockpit.thread_health?.status,
      sla_breach_open_tasks: decision_engine.signals?.sla_breach_open_tasks,
      horizontal_sla_overdue: predictive.horizontal_sla_overdue,
      decision_score: decision_engine.decision_score,
    };
    const policyEval = evaluatePolicyRules(policyCtx);
    const automation = buildActionAutomationSuggestions({
      predictive,
      decision_engine,
      health: cockpit.thread_health || {},
    });

    const navigation_meta = buildTimelineNavigationMeta(timelineFull, {
      anchor_sort_key: q.anchor_sort_key || null,
      open_coordination_count: horizontalOpen,
    });

    const jumpKey = String(q.jump || "").trim();
    const jump_to_sort_key =
      jumpKey && navigation_meta.jump_targets && navigation_meta.jump_targets[jumpKey] != null
        ? navigation_meta.jump_targets[jumpKey]
        : null;

    return res.json({
      success: true,
      data: {
        execution_thread_id: id,
        mode: compact ? "ringkas" : "detail",
        timeline: timelineOut,
        aktivitas: timelineOut,
        timeline_unfiltered_count: timelineFull.length,
        navigation_meta: {
          ...navigation_meta,
          jump_hint: jump_to_sort_key,
        },
        cockpit,
        kpi_hierarki,
        decision_engine,
        insights: {
          predictive,
          policy_engine: {
            version: policyEval.version,
            flags: policyEval.flags,
          },
          suggested_actions: automation.suggested_actions,
          action_disclaimer: automation.disclaimer,
        },
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal memuat thread eksekusi",
      error: err.message,
    });
  }
}

export async function getExecutionHubSummary(req, res) {
  try {
    const hub = await buildExecutionHubForUser(req.user);
    return res.json({ success: true, data: hub });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal memuat ringkasan hub eksekusi",
      error: err.message,
    });
  }
}

export async function getHierarchyKpiRollup(req, res) {
  try {
    const rollup = await buildHierarchyKpiRollupForUser(req.user);
    return res.json({ success: true, data: rollup });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal memuat rollup KPI hierarki",
      error: err.message,
    });
  }
}

function canViewCrossThreadAnalytics(user) {
  const r = String(user?.role || "")
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  if (r === "super_admin") return true;
  if (r.includes("gubernur")) return true;
  if (r === "kepala_dinas") return true;
  return false;
}

export async function getCrossThreadAnalytics(req, res) {
  try {
    if (!canViewCrossThreadAnalytics(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Akses analitik lintas thread ditolak.",
      });
    }
    const data = await buildCrossThreadAnalyticsSnapshot();
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal memuat analitik lintas thread",
      error: err.message,
    });
  }
}
