import { Op } from "sequelize";
import { InstruksiGubernur } from "../models/index.js";
import { loadExecutiveGovernance } from "./executiveGovernanceLoader.js";

function daysBetween(a, b) {
  return Math.floor((b - a) / 86400000);
}

/**
 * Rasio terlambat Kadis (assigned_to) untuk instruksi gubernur dalam ~90 hari.
 */
export async function computeKadisTerlambatRatio(assignedToUserId, gubernurCreatedBy) {
  const since = new Date();
  since.setDate(since.getDate() - 90);
  const rows = await InstruksiGubernur.findAll({
    where: {
      assigned_to: assignedToUserId,
      created_by: gubernurCreatedBy,
      created_at: { [Op.gte]: since },
    },
    attributes: ["id", "status"],
  });
  if (!rows.length) return 0;
  const late = rows.filter((r) => String(r.status).toLowerCase() === "terlambat").length;
  return late / rows.length;
}

/**
 * Rule engine sederhana (ID dari executiveGovernance.json).
 */
export async function evaluateDecisionSupportForPengajuan(pengajuanRow, gubernurId) {
  const rules = loadExecutiveGovernance().decision_support_rules || [];
  const out = [];
  const p = pengajuanRow?.toJSON ? pengajuanRow.toJSON() : pengajuanRow;
  const usia_hari = p?.created_at
    ? daysBetween(new Date(p.created_at), new Date())
    : 0;
  const ratio = await computeKadisTerlambatRatio(p.submitted_by, gubernurId);

  for (const r of rules) {
    const id = r.id;
    let hit = false;
    if (id === "DS-01") {
      hit = Number(p.revisi_ke || 0) >= 2;
    } else if (id === "DS-02") {
      hit = ratio > 0.25;
    } else if (id === "DS-03") {
      hit =
        String(p.jenis) === "persetujuan_anggaran" &&
        !(p.lampiran_url && String(p.lampiran_url).trim());
    } else if (id === "DS-04") {
      hit =
        usia_hari <= 3 &&
        (!p.catatan_gubernur || !String(p.catatan_gubernur).trim());
    }
    if (hit) {
      out.push({
        rule_id: id,
        recommendation: r.recommendation,
        severity: r.severity || "low",
      });
    }
  }
  return out;
}

export function mergeSeverity(list) {
  if (!list.length) return null;
  const order = { high: 3, medium: 2, low: 1 };
  let best = "low";
  for (const x of list) {
    if ((order[x.severity] || 0) > (order[best] || 0)) best = x.severity;
  }
  return best;
}

/**
 * Profil keputusan rule-based untuk UI Gubernur (bukan model ML).
 * Keluaran: skor, tingkat severitas operasional, label rekomendasi, dan jejak aturan.
 */
export function buildPengajuanDecisionProfile(pengajuanRow, rulesHit) {
  const p = pengajuanRow?.toJSON ? pengajuanRow.toJSON() : pengajuanRow;
  let score = 76;
  const explainLines = [];
  for (const r of rulesHit || []) {
    const sev = String(r.severity || "low").toLowerCase();
    if (sev === "high") score -= 30;
    else if (sev === "medium") score -= 18;
    else score -= 6;
    explainLines.push(`${r.rule_id}: ${r.recommendation}`);
  }
  const hasLampiran = !!(p.lampiran_url && String(p.lampiran_url).trim());
  if (String(p.jenis) === "persetujuan_anggaran" && hasLampiran) score += 10;
  if (Number(p.revisi_ke || 0) === 0) score += 6;
  if (Number(p.revisi_ke || 0) >= 2) score -= 12;
  score = Math.max(0, Math.min(100, Math.round(score)));

  const hasHigh = (rulesHit || []).some(
    (x) => String(x.severity || "").toLowerCase() === "high",
  );
  const hasMedium = (rulesHit || []).some(
    (x) => String(x.severity || "").toLowerCase() === "medium",
  );
  const revisiBesar = Number(p.revisi_ke || 0) >= 2;

  let recommendation_label;
  let recommendation_key;
  let severity_level;

  if (hasHigh) {
    recommendation_label = "Risiko tinggi";
    recommendation_key = "high_risk";
    severity_level = "critical";
  } else if (hasMedium || revisiBesar) {
    recommendation_label = "Perlu klarifikasi";
    recommendation_key = "needs_clarification";
    severity_level = "warning";
  } else if (score >= 70) {
    recommendation_label = "Disarankan disetujui";
    recommendation_key = "suggested_approve";
    severity_level = "normal";
  } else {
    recommendation_label = "Tinjau dokumen";
    recommendation_key = "review";
    severity_level = "warning";
  }

  return {
    decision_score: score,
    severity_level,
    recommendation_label,
    recommendation_key,
    rules_fired: rulesHit || [],
    explain_lines: explainLines,
  };
}

export async function enrichPengajuanWithDecisionProfile(pengajuanRow, gubernurId) {
  const rulesHit = await evaluateDecisionSupportForPengajuan(
    pengajuanRow,
    gubernurId,
  );
  const profile = buildPengajuanDecisionProfile(pengajuanRow, rulesHit);
  return {
    ...profile,
    decision_support: rulesHit,
    decision_severity: mergeSeverity(rulesHit),
  };
}
