import { Op } from "sequelize";
import { Task, User } from "../../models/index.js";
import TaskAssignment from "../../models/TaskAssignment.js";
import { getIO, ROOMS } from "../../services/socketService.js";

function ensureAssoc() {
  if (!Task.associations?.assignments) {
    Task.hasMany(TaskAssignment, { foreignKey: "task_id", as: "assignments" });
  }
}

const ALLOWED_ASSIGNEE_ROLES = new Set([
  "sekretaris",
  "kepala_bidang_ketersediaan",
  "kepala_bidang_distribusi",
  "kepala_bidang_konsumsi",
  "kepala_uptd",
]);

function normalizePriority(p) {
  const n = Number(p);
  if ([1, 2, 3, 4].includes(n)) return n;
  return 3;
}

export async function createPerintah(req, res) {
  try {
    ensureAssoc();
    const io = getIO();
    const kadinId = req.user?.id;
    const {
      title,
      description,
      assignee_role,
      assignee_user_id,
      due_date,
      priority,
      sumber_instruksi_gubernur_id,
      scope_unit,
      jenis_perintah,
    } = req.body || {};

    if (!title || !assignee_role) {
      return res.status(400).json({ success: false, message: "Field wajib: title, assignee_role" });
    }
    const r = String(assignee_role).toLowerCase();
    if (!ALLOWED_ASSIGNEE_ROLES.has(r)) {
      return res.status(400).json({ success: false, message: "assignee_role tidak valid untuk Kepala Dinas" });
    }

    const task = await Task.create({
      title,
      description: description || null,
      created_by: kadinId,
      source_unit: "Kepala Dinas",
      status: "assigned",
      priority: normalizePriority(priority),
      due_date: due_date ? new Date(due_date) : null,
      metadata: {
        jenis_perintah: jenis_perintah || "instruksi",
        scope_unit: scope_unit || null,
        sumber_instruksi_gubernur_id: sumber_instruksi_gubernur_id || null,
      },
    });

    await TaskAssignment.create({
      task_id: task.id,
      assignee_role: r,
      assignee_user_id: assignee_user_id ? Number(assignee_user_id) : null,
      assigned_by: kadinId,
      status: "assigned",
    });

    if (io) {
      // broadcast ke room masing-masing Eselon III melalui room SEKRETARIS/KADIN yg sudah ada
      // Untuk MVP: Sekretaris room dipakai sebagai relay operasional; kabid/uptd akan membaca via API.
      io.to(ROOMS.SEKRETARIS).emit("kadin:perintah:baru", {
        taskId: task.id,
        assignee_role: r,
        title: task.title,
      });
    }

    return res.json({ success: true, data: task });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal buat perintah", error: err.message });
  }
}

export async function listPerintah(req, res) {
  try {
    ensureAssoc();
    const kadinId = req.user?.id;
    const { status, q, limit = 50 } = req.query || {};

    const where = { created_by: kadinId };
    if (status) where.status = status;
    if (q) where.title = { [Op.iLike]: `%${q}%` };

    const rows = await Task.findAll({
      where,
      include: [{ model: TaskAssignment, as: "assignments", required: false }],
      order: [["created_at", "DESC"]],
      limit: Number(limit),
    });

    return res.json({ success: true, data: rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal list perintah", error: err.message });
  }
}

export async function getPerintahDetail(req, res) {
  try {
    ensureAssoc();
    const kadinId = req.user?.id;
    const id = parseInt(req.params.id, 10);
    const row = await Task.findByPk(id, {
      include: [{ model: TaskAssignment, as: "assignments", required: false }],
    });
    if (!row || row.created_by !== kadinId) {
      return res.status(404).json({ success: false, message: "Perintah tidak ditemukan" });
    }
    return res.json({ success: true, data: row });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal ambil detail perintah", error: err.message });
  }
}

