import { Op } from "sequelize";
import { InstruksiGubernur, PengajuanKeGubernur } from "../../models/index.js";
import { enrichPengajuanWithDecisionProfile } from "../../services/executiveDecisionSupportService.js";
import {
  evaluateInstructionSla,
  evaluatePengajuanSla,
} from "../../services/executiveSlaService.js";
import { getKinerjaKadisAggregation } from "../../services/executiveKinerjaAggregationService.js";

function ymd(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function isDeadlinePast(deadlineStr) {
  if (!deadlineStr) return false;
  return String(deadlineStr).slice(0, 10) < ymd();
}

/**
 * GET /gubernur/dashboard/hari-ini
 * Ringkasan prioritas harian + SLA + saran keputusan.
 */
export async function getDashboardHariIni(req, res) {
  try {
    const gubernurId = req.user?.id;

    const pengajuanMenunggu = await PengajuanKeGubernur.findAll({
      where: { status: { [Op.in]: ["diajukan", "dalam_review"] } },
      order: [["created_at", "ASC"]],
      limit: 25,
    });

    const putusan_hari_ini = [];
    for (const p of pengajuanMenunggu.slice(0, 8)) {
      const profile = await enrichPengajuanWithDecisionProfile(p, gubernurId);
      putusan_hari_ini.push({
        ...p.toJSON(),
        sla: evaluatePengajuanSla(p),
        ...profile,
      });
    }

    const instruksiRows = await InstruksiGubernur.findAll({
      where: { created_by: gubernurId },
      order: [["updated_at", "DESC"]],
      limit: 80,
    });

    const perintah_terlambat = [];
    const masalah_prioritas_tinggi = [];

    for (const row of instruksiRows) {
      const j = row.toJSON();
      const st = String(j.status || "").toLowerCase();
      if (st === "selesai" || st === "draf") continue;

      const sla = evaluateInstructionSla(j);
      j.sla = sla;

      const past = isDeadlinePast(j.deadline);
      if (st === "terlambat" || (past && !["selesai", "draf"].includes(st))) {
        perintah_terlambat.push(j);
      }

      const pr = String(j.prioritas || "").toLowerCase();
      const jn = String(j.jenis || "").toLowerCase();
      if (
        pr === "mendesak" ||
        jn === "tanggap_darurat" ||
        (sla.at_risk && (pr === "tinggi" || jn === "tanggap_darurat"))
      ) {
        masalah_prioritas_tinggi.push(j);
      }
    }

    const kinerja_ringkas = await getKinerjaKadisAggregation(gubernurId);

    return res.json({
      success: true,
      data: {
        generated_at: new Date().toISOString(),
        putusan_hari_ini,
        perintah_terlambat: perintah_terlambat.slice(0, 10),
        masalah_prioritas_tinggi: masalah_prioritas_tinggi.slice(0, 10),
        pengajuan_menunggu_count: pengajuanMenunggu.length,
        kinerja_kadis_ringkas: kinerja_ringkas,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal memuat dashboard hari ini",
      error: err.message,
    });
  }
}
