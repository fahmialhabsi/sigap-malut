import express from "express";
import { Op } from "sequelize";
import Notification from "../models/Notification.js";
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

export default router;
