import { Op } from "sequelize";
import Task from "../models/Task.js";
import ClarificationThread from "../models/ClarificationThread.js";
import InstruksiGubernur from "../models/InstruksiGubernur.js";
import ExecutionThreadEvent from "../models/ExecutionThreadEvent.js";
import { fetchOperationalRowsForThread } from "./executionThreadOperationalQuery.js";

const TASK_CLOSED = new Set(["closed", "rejected"]);

const STALE_DAYS_WARNING = 5;
const STALE_DAYS_CRITICAL = 10;
const CLAR_WARNING = 4;
const CLAR_CRITICAL = 8;
const REVISI_WARNING = 2;

function daysBetween(a, b) {
  return (b.getTime() - a.getTime()) / 86400000;
}

/**
 * Evaluasi kesehatan thread + bottleneck sederhana (rule-based, bukan ML).
 */
export async function evaluateExecutionThreadHealth(threadId) {
  const t = String(threadId);
  const now = new Date();
  const reasons = [];
  const bottlenecks = [];

  const [tasks, instruksi, clarCount, maxRev, events] = await Promise.all([
    Task.findAll({
      where: { execution_thread_id: t },
      attributes: ["id", "status", "due_date", "updated_at", "revisi_ke", "title"],
    }),
    InstruksiGubernur.findOne({
      where: { execution_thread_id: t },
      attributes: ["id", "status", "deadline", "updated_at", "judul"],
    }),
    ClarificationThread.count({ where: { execution_thread_id: t } }),
    Task.max("revisi_ke", { where: { execution_thread_id: t } }),
    ExecutionThreadEvent.findAll({
      where: { execution_thread_id: t },
      attributes: ["created_at"],
      order: [["created_at", "DESC"]],
      limit: 1,
    }),
  ]);

  const opRows = await fetchOperationalRowsForThread(t);

  const lastEventAt = events[0]?.created_at
    ? new Date(events[0].created_at)
    : null;
  const lastTaskUpd = tasks.reduce((mx, tk) => {
    const d = tk.updated_at ? new Date(tk.updated_at) : null;
    return d && (!mx || d > mx) ? d : mx;
  }, null);
  const lastOpUpd = opRows.reduce((mx, r) => {
    const d = r.updated_at ? new Date(r.updated_at) : null;
    return d && (!mx || d > mx) ? d : mx;
  }, null);
  const lastInstr = instruksi?.updated_at ? new Date(instruksi.updated_at) : null;

  const candidates = [lastEventAt, lastTaskUpd, lastOpUpd, lastInstr].filter(Boolean);
  const lastActivity = candidates.length ? new Date(Math.max(...candidates.map((d) => d.getTime()))) : null;

  let staleDays = null;
  if (lastActivity) {
    staleDays = daysBetween(lastActivity, now);
    if (staleDays >= STALE_DAYS_CRITICAL) {
      reasons.push({
        code: "STALE_ACTIVITY",
        severity: "critical",
        detail: `Tidak ada aktivitas tercatat ~${Math.floor(staleDays)} hari.`,
      });
      bottlenecks.push({ type: "diam", label: "Thread tanpa update signifikan" });
    } else if (staleDays >= STALE_DAYS_WARNING) {
      reasons.push({
        code: "STALE_ACTIVITY",
        severity: "warning",
        detail: `Aktivitas terakhir ~${Math.floor(staleDays)} hari lalu.`,
      });
    }
  } else {
    reasons.push({
      code: "NO_ACTIVITY",
      severity: "warning",
      detail: "Belum ada jejak aktivitas pada thread ini.",
    });
  }

  if (clarCount >= CLAR_CRITICAL) {
    reasons.push({
      code: "MANY_CLARIFICATIONS",
      severity: "critical",
      detail: `${clarCount} thread klarifikasi — risiko koordinasi berulang.`,
    });
    bottlenecks.push({ type: "klarifikasi", label: "Volume klarifikasi tinggi" });
  } else if (clarCount >= CLAR_WARNING) {
    reasons.push({
      code: "MANY_CLARIFICATIONS",
      severity: "warning",
      detail: `${clarCount} klarifikasi aktif/tercatat.`,
    });
  }

  const mr = Number(maxRev) || 0;
  if (mr >= REVISI_WARNING) {
    reasons.push({
      code: "HIGH_REVISION",
      severity: mr >= 4 ? "critical" : "warning",
      detail: `Revisi tugas tertinggi: ${mr}.`,
    });
    bottlenecks.push({ type: "revisi", label: "Banyak siklus revisi" });
  }

  let overdue = 0;
  for (const tk of tasks) {
    if (TASK_CLOSED.has(String(tk.status || ""))) continue;
    if (tk.due_date && new Date(tk.due_date) < now) overdue += 1;
  }
  if (overdue > 0) {
    reasons.push({
      code: "OVERDUE_TASKS",
      severity: overdue >= 3 ? "critical" : "warning",
      detail: `${overdue} tugas melewati deadline.`,
    });
    bottlenecks.push({ type: "deadline", label: "Tugas terlambat" });
  }

  if (instruksi?.deadline) {
    const dl = new Date(instruksi.deadline);
    const st = String(instruksi.status || "");
    if (dl < now && !["selesai", "draf"].includes(st)) {
      reasons.push({
        code: "INSTRUKSI_LATE",
        severity: "critical",
        detail: "Instruksi melewati deadline dan belum selesai.",
      });
      bottlenecks.push({ type: "mandat", label: "Instruksi terlambat" });
    }
  }

  const escalated = tasks.filter((x) => String(x.status) === "escalated").length;
  if (escalated > 0) {
    reasons.push({
      code: "ESCALATION",
      severity: "warning",
      detail: `${escalated} tugas dalam status eskalasi.`,
    });
    bottlenecks.push({ type: "eskalasi", label: "Eskalasi aktif" });
  }

  const openLeaves = tasks.filter(
    (x) => !TASK_CLOSED.has(String(x.status || "")) && String(x.status) !== "draft",
  ).length;
  if (openLeaves >= 8) {
    bottlenecks.push({ type: "beban", label: "Banyak tugas paralel terbuka" });
  }

  const hasCritical = reasons.some((r) => r.severity === "critical");
  const hasWarning = reasons.some((r) => r.severity === "warning");
  const status = hasCritical ? "critical" : hasWarning ? "warning" : "normal";

  return {
    status,
    stale_days: staleDays != null ? Math.round(staleDays * 10) / 10 : null,
    last_activity_at: lastActivity ? lastActivity.toISOString() : null,
    reasons,
    bottlenecks,
    counts: {
      tasks: tasks.length,
      open_tasks: tasks.filter((x) => !TASK_CLOSED.has(String(x.status || ""))).length,
      clarification_threads: clarCount,
      operational_records: opRows.length,
      escalated_tasks: escalated,
      overdue_tasks: overdue,
    },
  };
}
