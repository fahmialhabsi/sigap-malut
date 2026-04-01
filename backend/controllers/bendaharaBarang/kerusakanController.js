import { Op } from "sequelize";
import LaporanKerusakanAset from "../../models/LaporanKerusakanAset.js";

export async function listMasuk(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit || "20", 10), 100);
    const rows = await LaporanKerusakanAset.findAll({
      where: { status_tindak_lanjut: { [Op.in]: ["belum_ditindaklanjuti", "sedang_diperiksa"] } },
      order: [["created_at", "DESC"]],
      limit,
    });
    return res.json({ success: true, data: rows, total: rows.length });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal mengambil laporan kerusakan", error: err.message });
  }
}

