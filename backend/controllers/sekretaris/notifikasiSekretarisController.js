// backend/controllers/sekretaris/notifikasiSekretarisController.js
// CRUD notifikasi spesifik Sekretaris

import { Op } from "sequelize";
import NotifikasiSekretaris from "../../models/NotifikasiSekretaris.js";

// GET /api/sekretaris/notifikasi
export const getNotifikasi = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { unread_only, page = 1, limit = 20 } = req.query;
    const where = { user_id: userId };
    if (unread_only === "true") where.sudah_dibaca = false;

    const offset = (Number(page) - 1) * Number(limit);
    const { count, rows } = await NotifikasiSekretaris.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      limit: Number(limit),
      offset,
      raw: true,
    });

    const unreadCount = await NotifikasiSekretaris.count({ where: { user_id: userId, sudah_dibaca: false } });

    res.json({ success: true, data: rows, total: count, unread: unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT /api/sekretaris/notifikasi/:id/baca
export const tandaiBaca = async (req, res) => {
  try {
    const notif = await NotifikasiSekretaris.findByPk(req.params.id);
    if (!notif) return res.status(404).json({ success: false, message: "Notifikasi tidak ditemukan." });
    if (notif.user_id !== req.user?.id) return res.status(403).json({ success: false, message: "Akses ditolak." });

    await notif.update({ sudah_dibaca: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT /api/sekretaris/notifikasi/baca-semua
export const tandaiBacaSemua = async (req, res) => {
  try {
    await NotifikasiSekretaris.update(
      { sudah_dibaca: true },
      { where: { user_id: req.user?.id, sudah_dibaca: false } }
    );
    res.json({ success: true, message: "Semua notifikasi ditandai dibaca." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
