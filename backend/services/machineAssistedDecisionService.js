import { buildThreadDecisionForThread } from "./executionThreadDecisionService.js";

function normalizeSignalsUsed(signals) {
  if (!signals || typeof signals !== "object") return [];
  return Object.entries(signals)
    .filter(([, v]) => v != null && v !== "" && v !== 0 && v !== false)
    .map(([key, value]) => ({ signal: key, value }));
}

/**
 * Lapisan machine-assisted di atas decision rule-based: skor keyakinan, risiko, dan alasan yang dapat diaudit.
 */
export async function buildMachineAssistedDecisionForThread(threadId) {
  const base = await buildThreadDecisionForThread(threadId);
  const ds = Number(base.decision_score ?? 50);
  const confidence_score = Math.max(0, Math.min(1, ds / 100));
  const slaBump = Number(base.signals?.sla_breach_open_tasks || 0) > 0 ? 0.12 : 0;
  const clarBump = Number(base.signals?.clarification_threads || 0) >= 4 ? 0.08 : 0;
  const risk_score = Math.max(0, Math.min(1, 1 - confidence_score + slaBump + clarBump));

  const reasons = (base.badges || []).map((b) => ({
    code: b.code,
    text: b.label,
    tone: b.tone,
  }));

  return {
    ...base,
    machine_assisted: {
      confidence_score: Math.round(confidence_score * 1000) / 1000,
      risk_score: Math.round(risk_score * 1000) / 1000,
      explainability: {
        reasons,
        signals_used: normalizeSignalsUsed(base.signals),
      },
      disclaimer:
        "Rekomendasi bersifat membantu keputusan manusia dan tidak menggantikan wewenang formal.",
    },
  };
}
