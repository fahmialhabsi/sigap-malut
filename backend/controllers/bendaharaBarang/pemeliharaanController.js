import { Op } from "sequelize";
import PemeliharaanAset from "../../models/PemeliharaanAset.js";

export async function listMendatang30Hari(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit || "30", 10), 100);
    const start = new Date();
    const end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const rows = await PemeliharaanAset.findAll({
      where: {
        status: { [Op.in]: ["dijadwalkan", "dalam_proses"] },
        tanggal_jadwal: {
          [Op.between]: [
            start.toISOString().slice(0, 10),
            end.toISOString().slice(0, 10),
          ],
        },
      },
      order: [["tanggal_jadwal", "ASC"]],
      limit,
    });
    return res.json({ success: true, data: rows, total: rows.length });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal mengambil jadwal pemeliharaan", error: err.message });
  }
}

