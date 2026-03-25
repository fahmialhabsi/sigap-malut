import express from "express";
import { Op } from "sequelize";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

// GET /api/notifications — notifikasi milik user terlogin
router.get("/", async (req, res) => {
  try {
    const userId = req.user?.id;
    const { limit = 50 } = req.query;
    const rows = await Notification.findAll({
      where: { target_user_id: userId },
      order: [["created_at", "DESC"]],
      limit: Number(limit),
    });
    const unread = rows.filter((n) => !n.seen).length;
    return res.json({ success: true, data: rows, unread });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/notifications/read-all
router.put("/read-all", async (req, res) => {
  try {
    await Notification.update(
      { seen: true },
      { where: { target_user_id: req.user?.id, seen: false } },
    );
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/notifications/:id/read
router.put("/:id/read", async (req, res) => {
  try {
    const n = await Notification.findOne({
      where: { id: req.params.id, target_user_id: req.user?.id },
    });
    if (!n)
      return res
        .status(404)
        .json({ success: false, message: "Notifikasi tidak ditemukan" });
    n.seen = true;
    await n.save();
    return res.json({ success: true, data: n });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/notifications/broadcast-bidang
// Sekretariat mengirim notifikasi koordinasi ke semua Kepala Bidang
router.post("/broadcast-bidang", async (req, res) => {
  try {
    const senderRole = req.user?.role;
    const allowedSenders = ["sekretaris", "super_admin", "kepala_dinas"];
    if (!allowedSenders.includes(senderRole)) {
      return res
        .status(403)
        .json({ success: false, message: "Akses ditolak." });
    }

    const { pesan, link } = req.body;
    if (!pesan || String(pesan).trim().length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Pesan tidak boleh kosong." });
    }
    // Sanitasi: max 500 karakter, tidak ada HTML
    const cleanPesan = String(pesan)
      .replace(/<[^>]*>/g, "")
      .trim()
      .slice(0, 500);
    const cleanLink = link
      ? String(link)
          .replace(/[<>"']/g, "")
          .slice(0, 500)
      : null;

    // Cari semua user dengan role kepala_bidang
    const targetRoles = [
      "kepala_bidang",
      "kepala_bidang_ketersediaan",
      "kepala_bidang_distribusi",
      "kepala_bidang_konsumsi",
    ];
    const targets = await User.findAll({
      where: { role: { [Op.in]: targetRoles } },
      attributes: ["id"],
    });

    if (targets.length === 0) {
      return res.json({
        success: true,
        sent: 0,
        message: "Tidak ada Kepala Bidang yang terdaftar.",
      });
    }

    const notifs = targets.map((u) => ({
      target_user_id: u.id,
      channel: "in_app",
      message: `[Koordinasi Sekretariat] ${cleanPesan}`,
      link: cleanLink,
      seen: false,
    }));

    await Notification.bulkCreate(notifs);
    return res.json({ success: true, sent: notifs.length });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
