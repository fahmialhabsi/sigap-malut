import { Op } from "sequelize";
import PenerimaanBarang from "../../models/PenerimaanBarang.js";

export async function listPending(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit || "20", 10), 100);
    const rows = await PenerimaanBarang.findAll({
      where: {
        status: { [Op.in]: ["menunggu_kedatangan", "barang_tiba", "menunggu_penerimaan", "pending"] },
      },
      order: [["updated_at", "DESC"]],
      limit,
    });
    return res.json({ success: true, data: rows, total: rows.length });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal mengambil penerimaan pending", error: err.message });
  }
}

export async function listDikembalikanPpk(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit || "20", 10), 100);
    const rows = await PenerimaanBarang.findAll({
      where: { status: "dikembalikan_ppk" },
      order: [["updated_at", "DESC"]],
      limit,
    });
    return res.json({ success: true, data: rows, total: rows.length });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal mengambil dikembalikan PPK", error: err.message });
  }
}

