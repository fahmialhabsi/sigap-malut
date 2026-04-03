import { Op } from "sequelize";
import { InstruksiGubernur, PengajuanKeGubernur } from "../../models/index.js";
import {
  computeDefaultDeadline,
  loadMatrixSync,
} from "../../services/instruksiDeadlineService.js";
import { getKinerjaKadisAggregation } from "../../services/executiveKinerjaAggregationService.js";
import { buildExecutiveCockpit } from "../../services/executiveCockpitService.js";

/** Pratinjau deadline dari matriks (untuk form Gubernur). */
export async function getSaranDeadline(req, res) {
  try {
    const jenis = String(req.query.jenis || "instruksi");
    const prioritas = String(req.query.prioritas || "normal");
    const deadline = computeDefaultDeadline(jenis, prioritas);
    return res.json({
      success: true,
      data: {
        deadline,
        matriks: loadMatrixSync(),
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal hitung saran deadline",
      error: err.message,
    });
  }
}

/**
 * Ringkasan "perlu perhatian" + potongan daftar untuk dashboard eksekutif.
 */
export async function getExecutiveAttention(req, res) {
  try {
    const gubernurId = req.user?.id;

    const [
      menungguDibacaKadis,
      dibacaBelumProses,
      terlambat,
      sedangDiproses,
      pengajuanMenunggu,
    ] = await Promise.all([
      InstruksiGubernur.findAll({
        where: { created_by: gubernurId, status: "diterbitkan" },
        order: [["deadline", "ASC"]],
        limit: 15,
      }),
      InstruksiGubernur.findAll({
        where: { created_by: gubernurId, status: "dibaca" },
        order: [["deadline", "ASC"]],
        limit: 15,
      }),
      InstruksiGubernur.findAll({
        where: { created_by: gubernurId, status: "terlambat" },
        order: [["deadline", "ASC"]],
        limit: 15,
      }),
      InstruksiGubernur.findAll({
        where: { created_by: gubernurId, status: "diproses" },
        order: [["deadline", "ASC"]],
        limit: 15,
      }),
      PengajuanKeGubernur.findAll({
        where: { status: { [Op.in]: ["diajukan", "dalam_review"] } },
        order: [["created_at", "DESC"]],
        limit: 15,
      }),
    ]);

    const pengajuanCount = await PengajuanKeGubernur.count({
      where: { status: { [Op.in]: ["diajukan", "dalam_review"] } },
    });

    return res.json({
      success: true,
      data: {
        ringkasan: {
          menunggu_dibaca_kadis: menungguDibacaKadis.length,
          dibaca_belum_ditindaklanjuti: dibacaBelumProses.length,
          sedang_diproses: sedangDiproses.length,
          terlambat: terlambat.length,
          pengajuan_menunggu_keputusan: pengajuanCount,
        },
        menunggu_dibaca_kadis: menungguDibacaKadis,
        dibaca_belum_ditindaklanjuti: dibacaBelumProses,
        sedang_diproses: sedangDiproses,
        terlambat,
        pengajuan_menunggu: pengajuanMenunggu,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal memuat perhatian eksekutif",
      error: err.message,
    });
  }
}

/**
 * Kinerja Kepala Dinas berdasarkan instruksi yang diterbitkan Gubernur ini (agregat sederhana).
 */
export async function getKinerjaKadisRingkas(req, res) {
  try {
    const gubernurId = req.user?.id;
    const data = await getKinerjaKadisAggregation(gubernurId);
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal memuat kinerja Kepala Dinas",
      error: err.message,
    });
  }
}

/** Mode satu layar: prioritas, antrean keputusan, peringatan, KPI. */
export async function getExecutiveCockpit(req, res) {
  try {
    const gubernurId = req.user?.id;
    const data = await buildExecutiveCockpit(gubernurId);
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal memuat cockpit eksekutif",
      error: err.message,
    });
  }
}
