import { Op } from "sequelize";
import sequelize from "../config/database.js";
import Task from "../models/Task.js";
import TaskAssignment from "../models/TaskAssignment.js";
import TaskLog from "../models/TaskLog.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

function normalizeRole(user) {
  return String(user?.role || user?.roleName || "").toLowerCase();
}

function normalizeUnit(user) {
  return String(user?.unit_kerja || "").toLowerCase();
}

function isKasubagTuUptd(user) {
  const r = normalizeRole(user);
  const u = normalizeUnit(user);
  if (!u.includes("uptd")) return false;
  return (
    r.includes("kasubag_uptd") ||
    r.includes("subbag_tata_usaha") ||
    r.includes("kasubbag_tata_usaha") ||
    r.includes("tata_usaha")
  );
}

async function notifyUser(targetUserId, taskId, message, link = null) {
  if (!targetUserId) return;
  await Notification.create({
    target_user_id: targetUserId,
    task_id: taskId,
    message,
    link,
  }).catch(() => {});
}

// GET /api/uptd/kasubag/tu-staff
export async function getPelaksanaTuStaff(req, res) {
  try {
    if (!isKasubagTuUptd(req.user)) {
      return res.status(403).json({ error: "forbidden" });
    }
    const rows = await User.findAll({
      where: {
        unit_kerja: { [Op.like]: "%UPTD_TU%" },
      },
      attributes: ["id", "nama_lengkap", "username", "role", "unit_kerja"],
      order: [["nama_lengkap", "ASC"]],
      limit: 200,
    }).catch(() => []);
    return res.json({ data: rows, total: rows.length });
  } catch {
    return res.status(500).json({ error: "internal_server_error" });
  }
}

// POST /api/uptd/kasubag/assign-tu
// Body: { title, description, assignee_user_id, due_date }
export async function assignTugasPelaksanaTu(req, res) {
  const t = await sequelize.transaction();
  try {
    if (!isKasubagTuUptd(req.user)) {
      await t.rollback();
      return res.status(403).json({ error: "forbidden" });
    }

    const actorId = req.user.id;
    const { title, description, assignee_user_id, due_date } = req.body || {};
    if (!title || !assignee_user_id) {
      await t.rollback();
      return res.status(400).json({
        error: "bad_request",
        message: "title dan assignee_user_id wajib diisi",
      });
    }

    const assignee = await User.findByPk(Number(assignee_user_id), {
      transaction: t,
    }).catch(() => null);
    if (!assignee) {
      await t.rollback();
      return res.status(400).json({ error: "assignee_not_found" });
    }
    const assUnit = normalizeUnit(assignee);
    const assRole = normalizeRole(assignee);
    const okTarget =
      assUnit.includes("uptd_tu") &&
      (assRole === "pelaksana" || assRole === "staf_pelaksana");
    if (!okTarget) {
      await t.rollback();
      return res.status(403).json({
        error: "UPTD_DUAL_TRACK_VIOLATION",
        message: "Kasubag TU hanya dapat assign ke Pelaksana TU (UPTD_TU).",
      });
    }

    const task = await Task.create(
      {
        title: String(title).slice(0, 255),
        description: description ? String(description).slice(0, 2000) : null,
        module: "UPTD_TU",
        source_unit: "UPTD",
        priority: 3,
        due_date: due_date ? new Date(due_date) : null,
        metadata: {
          unit_scope: "UPTD_TU",
          jalur: "admin",
        },
        created_by: actorId,
        status: "assigned",
      },
      { transaction: t },
    );

    const assignment = await TaskAssignment.create(
      {
        task_id: task.id,
        assignee_user_id: Number(assignee_user_id),
        assignee_role: "pelaksana",
        assigned_by: actorId,
        status: "assigned",
      },
      { transaction: t },
    );

    await TaskLog.create(
      {
        task_id: task.id,
        actor_id: actorId,
        action: "ASSIGN",
        note: "UPTD_TU: assign oleh Kasubag TU",
        data_new: task.toJSON(),
      },
      { transaction: t },
    ).catch(() => null);

    await t.commit();

    await notifyUser(
      assignee.id,
      task.id,
      `Anda mendapat tugas TU UPTD: "${task.title}"`,
      `/tasks/${task.id}`,
    );

    return res.status(201).json({ success: true, data: { task, assignment } });
  } catch (err) {
    await t.rollback();
    return res.status(500).json({ error: "internal_server_error" });
  }
}

