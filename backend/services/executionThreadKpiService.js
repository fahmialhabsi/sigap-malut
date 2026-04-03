import { Op } from "sequelize";
import Task from "../models/Task.js";
import TaskAssignment from "../models/TaskAssignment.js";
import InstruksiGubernur from "../models/InstruksiGubernur.js";
import ClarificationThread from "../models/ClarificationThread.js";
import ExecutionThreadEvent from "../models/ExecutionThreadEvent.js";
import { assigneeRoleToOrgLevel } from "./executionThreadOrgLevelUtils.js";
import { fetchOperationalRowsForThread } from "./executionThreadOperationalQuery.js";

if (!Task.associations?.assignments) {
  Task.hasMany(TaskAssignment, { foreignKey: "task_id", as: "assignments" });
}

const TASK_CLOSED = new Set(["closed", "rejected"]);

export function assigneeRoleToTier(role) {
  const tier = assigneeRoleToOrgLevel(role);
  if (tier === "gubernur") return "pelaksana";
  return tier;
}

function daysAgo(n) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - n);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/**
 * KPI hierarkis dalam satu thread: UPTD → Kabid → Sekretaris → Kadis → Gubernur.
 */
export async function buildHierarchicalKpiForThread(threadId) {
  const t = String(threadId);
  const tasks = await Task.findAll({
    where: { execution_thread_id: t },
    include: [{ model: TaskAssignment, as: "assignments", required: false }],
  });

  const tiers = {
    uptd: { open_assignments: 0, assignments: 0 },
    kabid: { open_assignments: 0, assignments: 0 },
    sekretaris: { open_assignments: 0, assignments: 0 },
    kadis: { open_assignments: 0, assignments: 0 },
    pelaksana: { open_assignments: 0, assignments: 0 },
  };

  for (const task of tasks) {
    const taskOpen = !TASK_CLOSED.has(String(task.status || ""));
    for (const a of task.assignments || []) {
      const tier = assigneeRoleToTier(a.assignee_role);
      const bucket = tiers[tier] || tiers.pelaksana;
      bucket.assignments += 1;
      if (taskOpen) bucket.open_assignments += 1;
    }
  }

  const ig = await InstruksiGubernur.findOne({
    where: { execution_thread_id: t },
    attributes: ["id", "status", "judul"],
  });

  const gubernur = {
    instruksi_id: ig?.id || null,
    status: ig?.status || null,
    ringkas: ig?.judul || null,
  };

  const chain = [
    { level: "uptd", label: "UPTD / balai pengawasan", ...tiers.uptd },
    { level: "kabid", label: "Kepala bidang", ...tiers.kabid },
    { level: "sekretaris", label: "Sekretaris (hub)", ...tiers.sekretaris },
    { level: "kadis", label: "Kepala dinas", ...tiers.kadis },
    {
      level: "gubernur",
      label: "Gubernur / instruksi",
      assignments: ig ? 1 : 0,
      open_assignments:
        ig && !["selesai", "draf"].includes(String(ig.status || "")) ? 1 : 0,
    },
  ];

  return { chain, gubernur, tasks_in_thread: tasks.length };
}

/**
 * KPI thread + metrik perilaku (SLA, eskalasi, klarifikasi, operasional, tren aktivitas).
 */
export async function buildExtendedHierarchicalKpiForThread(threadId) {
  const base = await buildHierarchicalKpiForThread(threadId);
  const t = String(threadId);
  const now = new Date();
  const d7 = daysAgo(7);
  const d14 = daysAgo(14);

  const [
    clar,
    esc,
    slaBreach,
    opRows,
    ev7,
    evPrev,
    tasks,
    maxRev,
  ] = await Promise.all([
    ClarificationThread.count({ where: { execution_thread_id: t } }),
    Task.count({ where: { execution_thread_id: t, status: "escalated" } }),
    Task.count({
      where: {
        execution_thread_id: t,
        due_date: { [Op.lt]: now },
        status: { [Op.notIn]: [...TASK_CLOSED] },
      },
    }),
    fetchOperationalRowsForThread(t),
    ExecutionThreadEvent.count({
      where: { execution_thread_id: t, created_at: { [Op.gte]: d7 } },
    }),
    ExecutionThreadEvent.count({
      where: {
        execution_thread_id: t,
        created_at: { [Op.and]: [{ [Op.lt]: d7 }, { [Op.gte]: d14 }] },
      },
    }),
    Task.findAll({
      where: { execution_thread_id: t },
      attributes: ["id", "status"],
    }),
    Task.max("revisi_ke", { where: { execution_thread_id: t } }),
  ]);

  const total = tasks.length;
  const closed = tasks.filter((x) => TASK_CLOSED.has(String(x.status || ""))).length;
  const open = total - closed;
  const completionRate = total ? Math.round((closed / total) * 1000) / 1000 : null;
  const bottleneckRate = total ? Math.round((open / total) * 1000) / 1000 : null;

  let activityTrend = "stabil";
  if (ev7 > evPrev * 1.15) activityTrend = "naik";
  else if (evPrev > 0 && ev7 < evPrev * 0.85) activityTrend = "turun";

  const slaComplianceApprox =
    total > 0
      ? Math.round(((total - slaBreach) / total) * 1000) / 1000
      : null;

  const qualityScore = (() => {
    let s = 100;
    if (slaBreach > 0) s -= Math.min(40, slaBreach * 10);
    if (esc > 0) s -= Math.min(25, esc * 8);
    if (clar > 3) s -= Math.min(20, (clar - 3) * 4);
    const mr = Number(maxRev) || 0;
    if (mr > 1) s -= Math.min(15, (mr - 1) * 5);
    return Math.max(0, Math.min(100, Math.round(s)));
  })();

  return {
    ...base,
    extended: {
      clarification_threads: clar,
      escalations: esc,
      sla_breach_open_tasks: slaBreach,
      operational_records: opRows.length,
      completion_rate: completionRate,
      bottleneck_rate: bottleneckRate,
      active_load_open_tasks: open,
      max_task_revisi: Number(maxRev) || 0,
      activity_events_7d: ev7,
      activity_events_prev_7d: evPrev,
      sla_compliance_approx: slaComplianceApprox,
      thread_completion_quality_score: qualityScore,
    },
    trends: {
      aktivitas_thread: activityTrend,
    },
  };
}
