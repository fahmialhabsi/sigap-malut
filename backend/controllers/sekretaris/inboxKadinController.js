import { Op } from "sequelize";
import Task from "../../models/Task.js";
import TaskAssignment from "../../models/TaskAssignment.js";
import User from "../../models/User.js";
import { getIO } from "../../services/socketService.js";

function ensureAssoc() {
  if (!Task.associations?.assignments) {
    Task.hasMany(TaskAssignment, { foreignKey: "task_id", as: "assignments" });
  }
  if (!TaskAssignment.associations?.assignee) {
    TaskAssignment.belongsTo(User, {
      foreignKey: "assignee_user_id",
      as: "assignee",
    });
  }
}

export const getInboxKadin = async (req, res) => {
  try {
    ensureAssoc();
    const { status, limit = 20 } = req.query;

    // Inbox KaDin = tasks yang di-assign ke role sekretaris
    const include = [
      {
        model: TaskAssignment,
        as: "assignments",
        where: { assignee_role: "sekretaris" },
        required: true,
        include: [{ model: User, as: "assignee", attributes: ["id", "nama_lengkap", "role"] }],
      },
    ];

    const where = {};
    if (status) where.status = status;

    const rows = await Task.findAll({
      where,
      include,
      order: [["created_at", "DESC"]],
      limit: Number(limit),
    });

    return res.json({ success: true, data: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getInboxKadinDetail = async (req, res) => {
  try {
    ensureAssoc();
    const task = await Task.findByPk(req.params.id, {
      include: [
        {
          model: TaskAssignment,
          as: "assignments",
          include: [{ model: User, as: "assignee", attributes: ["id", "nama_lengkap", "role"] }],
        },
      ],
    });
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });
    return res.json({ success: true, data: task });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const konfirmasiTerima = async (req, res) => {
  try {
    const io = getIO();

    const task = await Task.findByPk(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false });
    }

    task.status = "accepted";
    // catat assignee user di assignment juga (jika kosong)
    await task.save();

    io.to("kadin:dashboard").emit("task:updated", {
      taskId: task.id,
      status: "accepted",
    });

    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const distribusiTask = async (_req, res) => {
  // Akan diisi di Phase 2 lanjutan (buat task turunan + assign)
  return res.status(501).json({
    success: false,
    message: "distribusiTask belum diimplementasikan",
  });
};

export const laporSelesai = async (_req, res) => {
  // Akan diisi di Phase 2 lanjutan (close/submit ke KaDin)
  return res.status(501).json({
    success: false,
    message: "laporSelesai belum diimplementasikan",
  });
};
