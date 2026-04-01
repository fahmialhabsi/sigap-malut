import { Op } from "sequelize";
import Task from "../../models/Task.js";
import TaskAssignment from "../../models/TaskAssignment.js";

// GET /api/kasubag/inbox-sekretaris
export async function listInboxSekretaris(req, res) {
  try {
    const actorId = req.user?.id;
    if (!actorId) return res.status(401).json({ success: false, error: "unauthenticated" });

    const limitRaw = Number(req.query?.limit || 15);
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 50) : 15;

    const assignments = await TaskAssignment.findAll({
      where: { assignee_user_id: actorId },
      attributes: ["task_id"],
      order: [["created_at", "DESC"]],
      limit: 500,
    }).catch(() => []);

    const taskIds = assignments.map((a) => a.task_id);
    if (taskIds.length === 0) return res.json({ success: true, data: [], total: 0 });

    const rows = await Task.findAll({
      where: {
        id: { [Op.in]: taskIds },
        // inbox utama: yang baru ditugaskan/dalam proses awal
        status: { [Op.in]: ["assigned", "accepted", "in_progress"] },
      },
      order: [
        ["priority", "ASC"],
        ["due_date", "ASC"],
        ["created_at", "DESC"],
      ],
      limit,
    }).catch(() => []);

    return res.json({
      success: true,
      data: rows,
      total: rows.length,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// POST /api/kasubag/inbox-sekretaris/:id/konfirmasi
// Kita pakai action accept dari taskController agar status konsisten.
export async function konfirmasiTerimaInbox(req, res) {
  // handled by tasks/:id/accept in routes (proxy on frontend ideally)
  return res.status(400).json({
    success: false,
    message: "Gunakan POST /api/tasks/:id/accept untuk konfirmasi terima.",
  });
}

