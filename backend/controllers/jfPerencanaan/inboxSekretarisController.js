import { Op } from "sequelize";
import Task from "../../models/Task.js";
import TaskAssignment from "../../models/TaskAssignment.js";

export async function listInboxSekretaris(req, res) {
  try {
    const userId = req.user?.id;
    const limit = Math.min(parseInt(req.query.limit || "20", 10), 100);

    const assignments = await TaskAssignment.findAll({
      where: {
        assignee_user_id: userId,
        status: { [Op.in]: ["assigned", "accepted"] },
      },
      order: [["assigned_at", "DESC"]],
      limit,
    });

    const taskIds = assignments.map((a) => a.task_id).filter(Boolean);
    const tasks = taskIds.length
      ? await Task.findAll({
          where: { id: { [Op.in]: taskIds } },
          order: [["created_at", "DESC"]],
        })
      : [];

    const byId = new Map(tasks.map((t) => [t.id, t]));
    const rows = assignments
      .map((a) => {
        const t = byId.get(a.task_id);
        if (!t) return null;
        return {
          id: t.id,
          title: t.title,
          status: t.status,
          priority: t.priority,
          due_date: t.due_date,
          module: t.module,
          source_unit: t.source_unit,
          assigned_at: a.assigned_at,
          assignment_status: a.status,
        };
      })
      .filter(Boolean);

    return res.json({ success: true, data: rows, total: rows.length });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil inbox Sekretaris",
      error: err.message,
    });
  }
}

export async function konfirmasiTerima(req, res) {
  try {
    const userId = req.user?.id;
    const taskId = parseInt(req.params.id, 10);
    if (!taskId) {
      return res.status(400).json({ success: false, message: "Task ID tidak valid" });
    }

    const a = await TaskAssignment.findOne({
      where: { task_id: taskId, assignee_user_id: userId },
    });
    if (!a) {
      return res.status(404).json({ success: false, message: "Assignment tidak ditemukan" });
    }

    a.status = "accepted";
    await a.save();

    const t = await Task.findByPk(taskId);
    if (t && (t.status === "assigned" || t.status === "draft")) {
      t.status = "accepted";
      await t.save();
    }

    return res.json({ success: true, message: "Tugas dikonfirmasi diterima" });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal konfirmasi terima",
      error: err.message,
    });
  }
}

