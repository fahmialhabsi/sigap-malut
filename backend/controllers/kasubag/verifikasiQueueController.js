import { Op } from "sequelize";
import Task from "../../models/Task.js";
import TaskAssignment from "../../models/TaskAssignment.js";
import TaskLog from "../../models/TaskLog.js";
import Notification from "../../models/Notification.js";
import sequelize from "../../config/database.js";

// GET /api/kasubag/verifikasi
export async function listVerifikasiQueue(req, res) {
  try {
    const actorId = req.user?.id;
    if (!actorId) return res.status(401).json({ success: false, error: "unauthenticated" });

    const limitRaw = Number(req.query?.limit || 15);
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 50) : 15;

    const assignments = await TaskAssignment.findAll({
      where: { assignee_user_id: actorId },
      attributes: ["task_id"],
      order: [["created_at", "DESC"]],
      limit: 1000,
    }).catch(() => []);

    const taskIds = assignments.map((a) => a.task_id);
    if (taskIds.length === 0) return res.json({ success: true, data: [], total: 0 });

    const rows = await Task.findAll({
      where: { id: { [Op.in]: taskIds }, status: "submitted" },
      order: [["updated_at", "DESC"]],
      limit,
    }).catch(() => []);

    return res.json({ success: true, data: rows, total: rows.length });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// POST /api/kasubag/verifikasi/:id/kembalikan
export async function kembalikanKePelaksana(req, res) {
  const t = await sequelize.transaction();
  try {
    const actorId = req.user?.id;
    if (!actorId) {
      await t.rollback();
      return res.status(401).json({ success: false, error: "unauthenticated" });
    }

    const { catatan } = req.body || {};
    const note = String(catatan || "").trim();
    if (!note) {
      await t.rollback();
      return res.status(400).json({ success: false, message: "Catatan perbaikan wajib diisi." });
    }

    const task = await Task.findByPk(req.params.id, { transaction: t });
    if (!task) {
      await t.rollback();
      return res.status(404).json({ success: false, message: "Task tidak ditemukan." });
    }

    // Hanya task yang sedang menunggu verifikasi Kasubag
    if (task.status !== "submitted") {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: `Task tidak dalam status submitted (saat ini: ${task.status}).`,
      });
    }

    const old = task.toJSON();
    task.status = "returned_to_pelaksana";
    task.returned_by = actorId;
    task.returned_at = new Date();
    task.catatan_verifikasi = note;
    task.revisi_ke = Number(task.revisi_ke || 0) + 1;

    const meta = task.metadata || {};
    const history = Array.isArray(meta.revision_history) ? meta.revision_history : [];
    meta.revision_history = [
      {
        at: new Date().toISOString(),
        by: actorId,
        note,
        revisi_ke: task.revisi_ke,
      },
      ...history,
    ].slice(0, 20);
    task.metadata = meta;

    await task.save({ transaction: t });

    await TaskLog.create(
      {
        task_id: task.id,
        actor_id: actorId,
        action: "RETURN_TO_PELAKSANA",
        note,
        data_old: old,
        data_new: task.toJSON(),
      },
      { transaction: t },
    );

    // Notif ke pembuat (Pelaksana)
    await Notification.create(
      {
        target_user_id: task.created_by,
        task_id: task.id,
        message: `Task dikembalikan oleh Kasubag: ${note}`,
        link: `/tasks/${task.id}`,
      },
      { transaction: t },
    ).catch(() => {});

    await t.commit();
    return res.json({ success: true, data: task });
  } catch (err) {
    await t.rollback();
    return res.status(500).json({ success: false, error: err.message });
  }
}

// POST /api/kasubag/verifikasi/:id/ok
export async function verifikasiOk(req, res) {
  const t = await sequelize.transaction();
  try {
    const actorId = req.user?.id;
    if (!actorId) {
      await t.rollback();
      return res.status(401).json({ success: false, error: "unauthenticated" });
    }

    const task = await Task.findByPk(req.params.id, { transaction: t });
    if (!task) {
      await t.rollback();
      return res.status(404).json({ success: false, message: "Task tidak ditemukan." });
    }

    if (task.status !== "submitted") {
      await t.rollback();
      return res.status(400).json({
        success: false,
        message: `Task tidak dalam status submitted (saat ini: ${task.status}).`,
      });
    }

    const old = task.toJSON();
    task.status = "verified";
    await task.save({ transaction: t });

    await TaskLog.create(
      {
        task_id: task.id,
        actor_id: actorId,
        action: "VERIFY_BY_KASUBAG",
        data_old: old,
        data_new: task.toJSON(),
      },
      { transaction: t },
    );

    await t.commit();
    return res.json({ success: true, data: task });
  } catch (err) {
    await t.rollback();
    return res.status(500).json({ success: false, error: err.message });
  }
}

