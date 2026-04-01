import { Op } from "sequelize";
import Task from "../../models/Task.js";
import TaskAssignment from "../../models/TaskAssignment.js";
import User from "../../models/User.js";

function ensureAssoc() {
  if (!Task.associations?.assignments) {
    Task.hasMany(TaskAssignment, { foreignKey: "task_id", as: "assignments" });
  }
  if (!TaskAssignment.associations?.assignee) {
    TaskAssignment.belongsTo(User, { foreignKey: "assignee_user_id", as: "assignee" });
  }
}

export const listPerintahTimeline = async (req, res) => {
  try {
    ensureAssoc();
    const { limit = 50 } = req.query;

    // Timeline = task yang dibuat oleh sekretaris ATAU task turunan dari KaDin
    const rows = await Task.findAll({
      where: {
        [Op.or]: [
          { created_by: req.user.id },
          { sumber_perintah_kadin: { [Op.ne]: null } },
        ],
      },
      include: [
        {
          model: TaskAssignment,
          as: "assignments",
          include: [{ model: User, as: "assignee", attributes: ["id", "nama_lengkap", "role", "unit_kerja"] }],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: Number(limit),
    });

    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createPerintahTurunan = async (_req, res) => {
  // Di Phase 2 lanjutan: buat task turunan dan assignment ke bawahan
  return res.status(501).json({
    success: false,
    message: "createPerintahTurunan belum diimplementasikan",
  });
};

