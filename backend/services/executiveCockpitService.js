import { Op } from "sequelize";
import { InstruksiGubernur, PengajuanKeGubernur } from "../models/index.js";
import { enrichPengajuanWithDecisionProfile } from "./executiveDecisionSupportService.js";
import {
  evaluateInstructionSla,
  evaluatePengajuanSla,
} from "./executiveSlaService.js";
import { getKinerjaKadisAggregation } from "./executiveKinerjaAggregationService.js";
import { loadExecutiveGovernance } from "./executiveGovernanceLoader.js";
import { buildExecutionThreadCockpitExtensionGubernur } from "./executionThreadHubService.js";

function ymd(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function daysUntilDeadline(deadlineStr) {
  if (!deadlineStr) return 999;
  const d = new Date(`${String(deadlineStr).slice(0, 10)}T12:00:00`);
  const today = new Date(`${ymd()}T12:00:00`);
  return Math.floor((d - today) / 86400000);
}

function isOverdueInstruksi(row) {
  const st = String(row.status || "").toLowerCase();
  if (st === "selesai" || st === "draf") return false;
  if (st === "terlambat") return true;
  const dl = String(row.deadline || "").slice(0, 10);
  if (!dl) return false;
  return dl < ymd();
}

/**
 * Satu payload untuk dashboard Gubernur mode “satu layar — semua keputusan”.
 */
export async function buildExecutiveCockpit(gubernurId) {
  const cfg = loadExecutiveGovernance();

  const pengajuanRows = await PengajuanKeGubernur.findAll({
    where: { status: { [Op.in]: ["diajukan", "dalam_review"] } },
    order: [["created_at", "ASC"]],
    limit: 30,
  });

  const instruksiRows = await InstruksiGubernur.findAll({
    where: { created_by: gubernurId },
    order: [["updated_at", "DESC"]],
    limit: 80,
  });

  let overdueCount = 0;
  for (const row of instruksiRows) {
    const j = row.toJSON();
    const st = String(j.status || "").toLowerCase();
    if (st === "draf") continue;
    if (isOverdueInstruksi(j)) overdueCount += 1;
  }

  const instruksiQueue = [];
  for (const row of instruksiRows) {
    const j = row.toJSON();
    const st = String(j.status || "").toLowerCase();
    if (st === "selesai" || st === "draf") continue;
    const overdue = isOverdueInstruksi(j);
    const sla = evaluateInstructionSla(j);
    const dLeft = daysUntilDeadline(j.deadline);
    if (!overdue && st !== "terlambat" && !sla.at_risk && dLeft > 3) continue;

    let urgency = 200;
    if (st === "terlambat" || overdue) urgency = 950;
    else if (String(j.jenis) === "tanggap_darurat") urgency = 820;
    else if (String(j.prioritas) === "mendesak") urgency = 780;
    if (sla.at_risk) urgency += 200;
    urgency += Math.max(0, 7 - Math.min(dLeft, 7)) * 12;
    instruksiQueue.push({
      kind: "instruksi",
      urgency_score: urgency,
      item: { ...j, sla },
    });
  }

  const pengajuanMenunggu = pengajuanRows.length;
  const kinerja = await getKinerjaKadisAggregation(gubernurId);
  const k0 = kinerja[0];
  const kadisRendah =
    k0 && typeof k0.skor === "number" && k0.skor < 50 && (k0.total || 0) > 0;

  const prioritas_hari_ini = [];
  if (overdueCount > 0) {
    prioritas_hari_ini.push({
      id: "pi_late",
      emoji: "🔴",
      severity: "critical",
      count: overdueCount,
      label: `${overdueCount} instruksi terlambat atau lewat batas`,
      scroll_to: "cockpit-putusan",
    });
  }
  if (pengajuanMenunggu > 0) {
    prioritas_hari_ini.push({
      id: "pi_pengajuan",
      emoji: "🟡",
      severity: "warning",
      count: pengajuanMenunggu,
      label: `${pengajuanMenunggu} pengajuan menunggu keputusan Anda`,
      scroll_to: "cockpit-putusan",
    });
  }
  if (kadisRendah) {
    prioritas_hari_ini.push({
      id: "pi_kadis",
      emoji: "⚠️",
      severity: "warning",
      count: 1,
      label: "Kepala Dinas: performa perlu perhatian",
      scroll_to: "cockpit-kpi",
    });
  }
  if (prioritas_hari_ini.length === 0) {
    prioritas_hari_ini.push({
      id: "pi_ok",
      emoji: "🟢",
      severity: "normal",
      count: 0,
      label: "Tidak ada isu kritis — tinjau ringkas indikator",
      scroll_to: "cockpit-kpi",
    });
  }

  const pengajuanEnriched = [];
  for (const p of pengajuanRows) {
    const profile = await enrichPengajuanWithDecisionProfile(p, gubernurId);
    const sla = evaluatePengajuanSla(p);
    const pj = p.toJSON();
    const usia =
      sla.usia_hari ??
      Math.floor((Date.now() - new Date(pj.created_at)) / 86400000);
    let urgency = 400;
    if (sla.at_risk) urgency += 320;
    if (profile.severity_level === "critical") urgency += 260;
    if (profile.severity_level === "warning") urgency += 130;
    urgency += Math.min(usia, 14) * 6;
    urgency += Number(pj.revisi_ke || 0) * 18;
    pengajuanEnriched.push({
      kind: "pengajuan",
      urgency_score: urgency,
      item: { ...pj, sla, ...profile },
    });
  }

  const deck = [...pengajuanEnriched, ...instruksiQueue]
    .sort((a, b) => b.urgency_score - a.urgency_score)
    .slice(0, 5);

  const [revisiBerkali, terlambatAktif, pengajuanLama] = await Promise.all([
    PengajuanKeGubernur.count({
      where: {
        status: { [Op.in]: ["diajukan", "dalam_review"] },
        revisi_ke: { [Op.gte]: 2 },
      },
    }),
    InstruksiGubernur.count({
      where: { created_by: gubernurId, status: "terlambat" },
    }),
    PengajuanKeGubernur.count({
      where: {
        status: { [Op.in]: ["diajukan", "dalam_review"] },
        created_at: {
          [Op.lt]: new Date(
            Date.now() -
              Number(cfg.pengajuan_ke_gubernur?.batas_menunggu_keputusan_hari || 14) *
                86400000,
          ),
        },
      },
    }),
  ]);

  const highlight_masalah = [];
  if (terlambatAktif >= 2 || overdueCount >= 3) {
    highlight_masalah.push({
      id: "hm_late_pattern",
      level: "critical",
      headline: "Pola keterlambatan instruksi",
      detail:
        "Banyak instruksi melewati batas atau berstatus terlambat. Pertimbangkan eskalasi atau penyesuaian beban.",
    });
  }
  if (revisiBerkali > 0) {
    highlight_masalah.push({
      id: "hm_revisi",
      level: "warning",
      headline: "Pengajuan bolak-balik revisi",
      detail: `${revisiBerkali} pengajuan aktif sudah revisi berulang — disarankan klarifikasi tertulis.`,
    });
  }
  if (pengajuanLama > 0) {
    highlight_masalah.push({
      id: "hm_stale",
      level: "warning",
      headline: "Pengajuan lama belum diputuskan",
      detail: `${pengajuanLama} pengajuan melewati batas waktu tunggu kebijakan.`,
    });
  }
  if (kadisRendah) {
    highlight_masalah.push({
      id: "hm_kadis",
      level: "warning",
      headline: "Kinerja pelaksanaan instruksi",
      detail:
        "Skor penyelesaian Kepala Dinas di bawah ambang — monitor tindak lanjut dekat.",
    });
  }

  const now = Date.now();
  const d7 = new Date(now - 7 * 86400000);
  const d14 = new Date(now - 14 * 86400000);

  const [selesai_7d, selesai_prev_7d, aktif_now, selesai_total_recent] =
    await Promise.all([
      InstruksiGubernur.count({
        where: {
          created_by: gubernurId,
          status: "selesai",
          updated_at: { [Op.gte]: d7 },
        },
      }),
      InstruksiGubernur.count({
        where: {
          created_by: gubernurId,
          status: "selesai",
          updated_at: { [Op.gte]: d14, [Op.lt]: d7 },
        },
      }),
      InstruksiGubernur.count({
        where: {
          created_by: gubernurId,
          status: { [Op.in]: ["diterbitkan", "dibaca", "diproses", "terlambat"] },
        },
      }),
      InstruksiGubernur.count({
        where: { created_by: gubernurId, status: "selesai" },
      }),
    ]);

  const deltaSelesai = selesai_7d - selesai_prev_7d;
  const totalTracked = aktif_now + selesai_total_recent;
  const sla_compliance_pct =
    totalTracked > 0
      ? Math.round(
          (Math.max(0, totalTracked - overdueCount) / totalTracked) * 100,
        )
      : 100;

  const execution_threads =
    await buildExecutionThreadCockpitExtensionGubernur(gubernurId);

  const smart_kpi = {
    penyelesaian_7_hari: selesai_7d,
    penyelesaian_trend: {
      delta: deltaSelesai,
      direction: deltaSelesai > 0 ? "up" : deltaSelesai < 0 ? "down" : "flat",
      label:
        deltaSelesai > 0
          ? "Meningkat vs minggu lalu"
          : deltaSelesai < 0
            ? "Menurun vs minggu lalu"
            : "Stabil vs minggu lalu",
    },
    instruksi_aktif: aktif_now,
    keterlambatan_aktif: overdueCount,
    keterlambatan_trend: {
      delta: overdueCount,
      direction: overdueCount > 2 ? "up" : "flat",
      label:
        overdueCount > 2
          ? "Perlu perhatian segera"
          : "Dalam batas pantauan",
    },
    sla_compliance_pct,
    sla_trend: {
      direction: sla_compliance_pct >= 75 ? "up" : "down",
      label:
        sla_compliance_pct >= 75
          ? "Kepatuhan respons baik"
          : "Kepatuhan perlu ditingkatkan",
    },
    kinerja_kadis: kinerja,
  };

  return {
    generated_at: new Date().toISOString(),
    prioritas_hari_ini,
    yang_harus_diputuskan: deck,
    highlight_masalah,
    smart_kpi,
    execution_threads,
    meta: {
      audit_modul_instruksi: "EXECUTIVE_INSTRUKSI",
      audit_modul_pengajuan: "EXECUTIVE_PENGAJUAN_KE_GUBERNUR",
    },
  };
}
