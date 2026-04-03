import { Op } from "sequelize";
import sequelize from "../config/database.js";
import Task from "../models/Task.js";
import TaskAssignment from "../models/TaskAssignment.js";
import TaskLog from "../models/TaskLog.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

function roleLower(user) {
  return String(user?.role || user?.roleName || "").toLowerCase();
}

function unitLower(user) {
  return String(user?.unit_kerja || "").toLowerCase();
}

function getSeksi(user) {
  const r = roleLower(user);
  if (r.includes("mutu")) return "mutu";
  if (r.includes("teknis")) return "teknis";
  if (unitLower(user).includes("uptd_mutu")) return "mutu";
  if (unitLower(user).includes("uptd_teknis")) return "teknis";
  return null;
}

function isKasiUptd(user) {
  const unit = unitLower(user);
  if (!unit.includes("uptd")) return false;
  const r = roleLower(user);
  return (
    r.includes("seksi_manajemen_mutu") ||
    r.includes("seksi_manajemen_teknis") ||
    r.includes("kasi_uptd") ||
    r.includes("kasi_mutu") ||
    r.includes("kasi_teknis") ||
    r.includes("kasi_mutu_uptd") ||
    r.includes("kasi_teknis_uptd")
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

// GET /api/uptd/kasi/staff?seksi=mutu|teknis (default from role)
export async function getPelaksanaSeksiStaff(req, res) {
  try {
    if (!isKasiUptd(req.user)) return res.status(403).json({ error: "forbidden" });
    const seksi = (req.query?.seksi && String(req.query.seksi).toLowerCase()) || getSeksi(req.user);
    if (!seksi || !["mutu", "teknis"].includes(seksi)) {
      return res.status(400).json({ error: "bad_request", message: "seksi tidak valid" });
    }
    const like = seksi === "mutu" ? "%UPTD_Mutu%" : "%UPTD_Teknis%";
    const rows = await User.findAll({
      where: { unit_kerja: { [Op.like]: like } },
      attributes: ["id", "nama_lengkap", "username", "role", "unit_kerja"],
      order: [["nama_lengkap", "ASC"]],
      limit: 200,
    }).catch(() => []);
    return res.json({ data: rows, total: rows.length, seksi });
  } catch {
    return res.status(500).json({ error: "internal_server_error" });
  }
}

// POST /api/uptd/kasi/assign
// Body: { title, description, assignee_user_id, due_date }
export async function assignTugasPelaksanaSeksi(req, res) {
  const t = await sequelize.transaction();
  try {
    if (!isKasiUptd(req.user)) {
      await t.rollback();
      return res.status(403).json({ error: "forbidden" });
    }
    const seksi = getSeksi(req.user);
    if (!seksi) {
      await t.rollback();
      return res.status(400).json({ error: "bad_request", message: "seksi tidak terdeteksi" });
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

    const assignee = await User.findByPk(Number(assignee_user_id), { transaction: t }).catch(() => null);
    if (!assignee) {
      await t.rollback();
      return res.status(400).json({ error: "assignee_not_found" });
    }

    const assUnit = unitLower(assignee);
    const assRole = roleLower(assignee);
    const okRole = assRole === "pelaksana" || assRole === "staf_pelaksana";
    const okUnit =
      seksi === "mutu" ? assUnit.includes("uptd_mutu") : assUnit.includes("uptd_teknis");
    if (!okRole || !okUnit) {
      await t.rollback();
      return res.status(403).json({
        error: "UPTD_SEKSI_SCOPE_VIOLATION",
        message:
          seksi === "mutu"
            ? "Kasi Mutu hanya dapat assign ke Pelaksana Mutu."
            : "Kasi Teknis hanya dapat assign ke Pelaksana Teknis.",
      });
    }

    const task = await Task.create(
      {
        title: String(title).slice(0, 255),
        description: description ? String(description).slice(0, 2000) : null,
        module: seksi === "mutu" ? "UPTD_Mutu" : "UPTD_Teknis",
        source_unit: "UPTD",
        priority: 3,
        due_date: due_date ? new Date(due_date) : null,
        metadata: {
          unit_scope: seksi === "mutu" ? "UPTD_Mutu" : "UPTD_Teknis",
          jalur: "teknis",
          seksi,
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
        note: `UPTD_${seksi.toUpperCase()}: assign oleh Kasi`,
        data_new: task.toJSON(),
      },
      { transaction: t },
    ).catch(() => null);

    await t.commit();

    await notifyUser(
      assignee.id,
      task.id,
      `Anda mendapat tugas UPTD (${seksi}): "${task.title}"`,
      `/tasks/${task.id}`,
    );

    return res.status(201).json({ success: true, data: { task, assignment, seksi } });
  } catch {
    await t.rollback();
    return res.status(500).json({ error: "internal_server_error" });
  }
}

