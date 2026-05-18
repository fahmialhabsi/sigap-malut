/**
 * backend/controllers/sekretaris/tugasVerifiedController.js
 *
 * BL-001 fix: Sekretaris dapat melihat dan memproses tugas yang sudah di-verify
 * Kasubag (status = "verified") → transisi ke "approved_by_secretary" atau
 * kembalikan ke in_progress via POST /api/tasks/:id/review
 */

import Task from "../../models/Task.js";
import TaskAssignment from "../../models/TaskAssignment.js";
import User from "../../models/User.js";
import { Op } from "sequelize";

/**
 * GET /api/sekretaris/tugas-terverifikasi
 * Mengembalikan tugas yang sudah diverifikasi Kasubag dan menunggu keputusan Sekretaris.
 */
export async function listTugasVerified(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit || "50", 10), 200);
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const offset = (page - 1) * limit;

    const { count, rows } = await Task.findAndCountAll({
      where: { status: "verified" },
      order: [["updated_at", "DESC"]],
      limit,
      offset,
      include: [
        {
          model: TaskAssignment,
          as: "assignments",
          include: [
            {
              model: User,
              as: "assignee",
              attributes: ["id", "nama_lengkap", "username", "role", "unit_kerja"],
            },
          ],
        },
        {
          model: User,
          as: "creator",
          attributes: ["id", "nama_lengkap", "username"],
        },
      ],
    });

    return res.json({
      success: true,
      data: rows.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        due_date: t.due_date,
        module: t.module,
        source_unit: t.source_unit,
        updated_at: t.updated_at,
        created_at: t.created_at,
        metadata: t.metadata,
        creator: t.creator,
        assignees: (t.assignments || []).map((a) => ({
          id: a.id,
          assignee: a.assignee,
          status: a.status,
          assigned_at: a.assigned_at,
        })),
      })),
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    console.error("[tugasVerifiedController]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}
