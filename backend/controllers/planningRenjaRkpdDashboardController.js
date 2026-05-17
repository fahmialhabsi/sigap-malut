import { fn, col } from "sequelize";
import { Renja, Rkpd } from "../models/index.js";

/**
 * GET /api/dashboard/renja-summary
 * Agregat ringkas Renja & RKPD untuk dashboard perencanaan.
 */
export async function getRenjaRkpdSummary(req, res) {
  try {
    const renjaCount = await Renja.count();
    const rkpdCount = await Rkpd.count();

    const sumRow = await Rkpd.findOne({
      attributes: [[fn("COALESCE", fn("SUM", col("pagu")), 0), "total_pagu"]],
      raw: true,
    });
    const totalPagu = Number(sumRow?.total_pagu ?? 0);

    const renjaRows = await Renja.findAll({
      attributes: ["id", "judul", "tahun", "program", "kegiatan"],
      order: [
        ["tahun", "DESC"],
        ["id", "DESC"],
      ],
      raw: true,
    });

    const rkpdRows = await Rkpd.findAll({
      attributes: ["renja_id", "pagu"],
      raw: true,
    });

    const agg = new Map();
    for (const r of rkpdRows) {
      if (r.renja_id == null) continue;
      const cur = agg.get(r.renja_id) || { jumlah_rkpd: 0, total_pagu: 0 };
      cur.jumlah_rkpd += 1;
      cur.total_pagu += Number(r.pagu || 0);
      agg.set(r.renja_id, cur);
    }

    const rkpd_per_renja = renjaRows.map((r) => {
      const a = agg.get(r.id) || { jumlah_rkpd: 0, total_pagu: 0 };
      return {
        renja_id: r.id,
        tahun: r.tahun,
        judul: r.judul,
        program: r.program,
        kegiatan: r.kegiatan,
        jumlah_rkpd: a.jumlah_rkpd,
        total_pagu: a.total_pagu,
      };
    });

    return res.json({
      success: true,
      data: {
        jumlah_renja: renjaCount,
        jumlah_rkpd: rkpdCount,
        total_pagu: totalPagu,
        rkpd_per_renja,
      },
    });
  } catch (err) {
    console.error("renja-summary", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Gagal memuat ringkasan Renja/RKPD",
    });
  }
}
