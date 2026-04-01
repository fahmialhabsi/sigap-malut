import { Op } from "sequelize";
import AsetBarang from "../../models/AsetBarang.js";

export async function getSummary(req, res) {
  try {
    const total = await AsetBarang.count().catch(() => 0);
    const baik = await AsetBarang.count({ where: { kondisi: "baik" } }).catch(() => 0);
    const rusakRingan = await AsetBarang.count({ where: { kondisi: "rusak_ringan" } }).catch(() => 0);
    const rusakBerat = await AsetBarang.count({ where: { kondisi: "rusak_berat" } }).catch(() => 0);
    const hilang = await AsetBarang.count({ where: { kondisi: "hilang" } }).catch(() => 0);

    return res.json({
      success: true,
      data: { total, baik, rusak_ringan: rusakRingan, rusak_berat: rusakBerat, hilang },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal mengambil ringkasan aset", error: err.message });
  }
}

export async function listKondisiKritis(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit || "20", 10), 100);
    const rows = await AsetBarang.findAll({
      where: { kondisi: { [Op.in]: ["rusak_berat", "hilang"] } },
      order: [["updated_at", "DESC"]],
      limit,
    });
    return res.json({ success: true, data: rows, total: rows.length });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal mengambil aset kritis", error: err.message });
  }
}

