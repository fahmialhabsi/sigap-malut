/**
 * Saran tindakan otomatisasi — hanya rekomendasi / flag, tanpa mutasi paksa rantai tugas.
 */
export function buildActionAutomationSuggestions({
  predictive = {},
  decision_engine = {},
  health = {},
} = {}) {
  const actions = [];
  const risk = String(predictive.coordination_delay_risk || "").toLowerCase();

  if (risk === "high" || risk === "medium") {
    actions.push({
      type: "coordination_followup",
      severity: risk === "high" ? "high" : "medium",
      label: "Tindak lanjut koordinasi lintas unit",
      detail:
        "Ada item koordinasi horizontal terbuka atau melewati SLA — pertimbangkan eskalasi ringan atau pengingat ke pihak terkait.",
      automated_execution: false,
    });
  }

  const sev = String(decision_engine.severity_level || "");
  if (sev === "intervensi") {
    actions.push({
      type: "executive_attention",
      severity: "high",
      label: "Butuh perhatian pimpinan",
      detail: decision_engine.recommendation_text || "",
      automated_execution: false,
    });
  }

  const hs = String(health.status || "");
  if (hs === "critical") {
    actions.push({
      type: "health_review",
      severity: "high",
      label: "Review kesehatan thread",
      detail: "Status thread kritis — kumpulkan fakta di timeline sebelum keputusan.",
      automated_execution: false,
    });
  }

  return {
    suggested_actions: actions,
    disclaimer:
      "Saran ini membantu workflow; keputusan dan tindakan resmi tetap pada pejabat berwenang.",
  };
}
