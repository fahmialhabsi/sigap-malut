import { NotifikasiGubernur } from "../../models/index.js";

export async function listNotifikasi(req, res) {
  try {
    const userId = req.user?.id;
    const { limit = 50 } = req.query || {};
    const rows = await NotifikasiGubernur.findAll({
      where: { user_id: userId },
      order: [
        ["sudah_dibaca", "ASC"],
        ["created_at", "DESC"],
      ],
      limit: Number(limit),
    });
    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal ambil notifikasi", error: err.message });
  }
}

export async function bacaNotifikasi(req, res) {
  try {
    const userId = req.user?.id;
    const id = parseInt(req.params.id, 10);
    const row = await NotifikasiGubernur.findByPk(id);
    if (!row || row.user_id !== userId) {
      return res.status(404).json({ success: false, message: "Notifikasi tidak ditemukan" });
    }
    row.sudah_dibaca = true;
    await row.save();
    return res.json({ success: true, data: row });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal update notifikasi", error: err.message });
  }
}

export async function bacaSemua(req, res) {
  try {
    const userId = req.user?.id;
    await NotifikasiGubernur.update({ sudah_dibaca: true }, { where: { user_id: userId, sudah_dibaca: false } });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal baca semua", error: err.message });
  }
}

