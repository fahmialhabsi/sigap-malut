import { Router } from "express";
import { protect } from "../middleware/auth.js";
import sequelize from "../config/database.js";

const router = Router();
router.use(protect);

/** GET /api/tasks/:taskId/discussions — ambil diskusi per task */
router.get("/:taskId/discussions", async (req, res) => {
  try {
    const { taskId } = req.params;
    const rows = await sequelize.query(
      `SELECT td.id, td.task_id, td.pesan, td.created_at,
              u1.name AS pengirim_nama, u2.name AS penerima_nama
       FROM task_discussions td
       JOIN "Users" u1 ON u1.id = td.pengirim_id
       JOIN "Users" u2 ON u2.id = td.penerima_id
       WHERE td.task_id = :taskId AND td.deleted_at IS NULL
       ORDER BY td.created_at ASC`,
      { replacements: { taskId }, type: sequelize.QueryTypes.SELECT }
    );
    return res.json({ success: true, data: rows });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

/** POST /api/tasks/:taskId/discussions — kirim pesan diskusi */
router.post("/:taskId/discussions", async (req, res) => {
  try {
    const { taskId } = req.params;
    const { penerima_id, pesan } = req.body;
    const pengirim_id = req.user?.id;

    if (!penerima_id || !pesan?.trim()) {
      return res.status(400).json({
        success: false,
        message: "penerima_id dan pesan wajib diisi",
      });
    }

    const [row] = await sequelize.query(
      `INSERT INTO task_discussions (task_id, pengirim_id, penerima_id, pesan, created_at, updated_at)
       VALUES (:taskId, :pengirim_id, :penerima_id, :pesan, now(), now())
       RETURNING id, task_id, pengirim_id, penerima_id, pesan, created_at`,
      {
        replacements: { taskId, pengirim_id, penerima_id, pesan: pesan.trim() },
        type: sequelize.QueryTypes.INSERT,
      }
    );

    return res.status(201).json({ success: true, data: row });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
});

export default router;
