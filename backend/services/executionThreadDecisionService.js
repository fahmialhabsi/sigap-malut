import { evaluateExecutionThreadHealth } from "./executionThreadHealthService.js";
import { buildExtendedHierarchicalKpiForThread } from "./executionThreadKpiService.js";

/**
 * Decision engine rule-based: skor + severity + teks rekomendasi untuk satu thread.
 */
export function buildDecisionFromSignals(health, kpiExtended = {}) {
  const ex = kpiExtended;
  let decision_score = 100;
  const badges = [];

  if (health?.status === "critical") {
    decision_score -= 42;
    badges.push({ code: "RISIKO_TINGGI", label: "Risiko tinggi", tone: "red", icon: "❗" });
  } else if (health?.status === "warning") {
    decision_score -= 20;
    badges.push({ code: "PERHATIAN", label: "Perlu perhatian", tone: "yellow", icon: "🟡" });
  }

  const openLoad = Number(ex.active_load_open_tasks || 0);
  if (openLoad >= 8) {
    decision_score -= 14;
    badges.push({ code: "BEBAN", label: "Beban berlebih", tone: "amber", icon: "⚠" });
  }

  const slaB = Number(ex.sla_breach_open_tasks || 0);
  if (slaB > 0) {
    decision_score -= Math.min(35, 12 + slaB * 6);
    badges.push({ code: "SLA", label: "SLA terbuka terlewat", tone: "red", icon: "🔴" });
  }

  const clar = Number(ex.clarification_threads || 0);
  if (clar >= 4) {
    decision_score -= Math.min(22, 8 + (clar - 3) * 4);
    badges.push({ code: "KLARIFIKASI", label: "Perlu klarifikasi", tone: "yellow", icon: "🟡" });
  }

  const esc = Number(ex.escalations || 0);
  if (esc >= 2) {
    decision_score -= 10;
    badges.push({ code: "ESKALASI", label: "Eskalasi berulang", tone: "amber", icon: "⚠" });
  }

  decision_score = Math.max(0, Math.min(100, Math.round(decision_score)));

  let severity_level = "normal";
  if (decision_score < 40) severity_level = "intervensi";
  else if (decision_score < 68) severity_level = "perhatian";

  let recommendation_key = "lanjut";
  if (severity_level === "intervensi") recommendation_key = "intervensi";
  else if (severity_level === "perhatian") recommendation_key = "perhatian";

  const texts = {
    lanjut: "Disarankan lanjut — tidak ada sinyal kritis yang menghambat eksekusi thread.",
    perhatian:
      "Perlu perhatian — pantau deadline, klarifikasi, dan distribusi tugas agar tidak memburuk.",
    intervensi:
      "Perlu intervensi — stagnasi, SLA, atau eskalasi memerlukan keputusan / arahan pimpinan.",
  };

  if (!badges.length) {
    badges.push({ code: "LANJUT", label: "Disarankan lanjut", tone: "green", icon: "🟢" });
  }

  return {
    decision_score,
    severity_level,
    recommendation_key,
    recommendation_text: texts[recommendation_key],
    badges,
    health_status: health?.status || "unknown",
    signals: {
      stale_days: health?.stale_days ?? null,
      overdue_tasks: health?.counts?.overdue_tasks ?? 0,
      clarification_threads: clar,
      sla_breach_open_tasks: slaB,
      active_load_open_tasks: openLoad,
      escalations: esc,
      quality_score: ex.thread_completion_quality_score ?? null,
    },
  };
}

export async function buildThreadDecisionForThread(threadId) {
  const [health, kpi] = await Promise.all([
    evaluateExecutionThreadHealth(threadId),
    buildExtendedHierarchicalKpiForThread(threadId),
  ]);
  return buildDecisionFromSignals(health, kpi.extended || {});
}
