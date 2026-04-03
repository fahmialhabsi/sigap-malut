import { evaluateExecutionThreadHealth } from "./executionThreadHealthService.js";
import { buildExecutionHubForUser } from "./executionThreadHubService.js";
import { buildExtendedHierarchicalKpiForThread } from "./executionThreadKpiService.js";

/**
 * Agregasi KPI hierarki untuk thread yang terlihat oleh user (sampel terbatas agar ringan).
 */
export async function buildHierarchyKpiRollupForUser(user) {
  const hub = await buildExecutionHubForUser(user);
  const threads = Array.isArray(hub.threads) ? hub.threads : [];
  const sample = threads.slice(0, 12);

  let sumClar = 0;
  let sumEsc = 0;
  let sumSla = 0;
  let sumOp = 0;
  let sumOpenTasks = 0;
  let sumQuality = 0;
  let critHealth = 0;
  let warnHealth = 0;
  const perThread = [];

  for (const row of sample) {
    const tid = row.thread_id;
    if (!tid) continue;
    const [kpi, health] = await Promise.all([
      buildExtendedHierarchicalKpiForThread(tid),
      evaluateExecutionThreadHealth(tid),
    ]);
    const ex = kpi.extended || {};
    sumClar += ex.clarification_threads || 0;
    sumEsc += ex.escalations || 0;
    sumSla += ex.sla_breach_open_tasks || 0;
    sumOp += ex.operational_records || 0;
    sumOpenTasks += ex.active_load_open_tasks || 0;
    sumQuality += ex.thread_completion_quality_score ?? 0;
    if (health.status === "critical") critHealth += 1;
    if (health.status === "warning") warnHealth += 1;
    perThread.push({
      thread_id: tid,
      label: row.label,
      kpi_extended: ex,
      thread_health: health.status,
    });
  }

  const n = sample.length || 1;
  return {
    perspective: hub.perspective,
    totals_hub: hub.totals,
    sample_size: sample.length,
    aggregates: {
      clarification_threads: sumClar,
      escalations: sumEsc,
      sla_breach_open_tasks: sumSla,
      operational_records: sumOp,
      active_load_open_tasks: sumOpenTasks,
      avg_thread_quality_score: Math.round(sumQuality / n),
      threads_critical_health: critHealth,
      threads_warning_health: warnHealth,
    },
    by_thread: perThread,
  };
}
