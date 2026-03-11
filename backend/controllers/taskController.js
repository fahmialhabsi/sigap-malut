// backend/controllers/taskController.js
// Handles all task lifecycle endpoints with audit logging and notifications.
//
// API endpoints:
//   POST   /api/tasks                    - Create a new task
//   GET    /api/tasks                    - List tasks (filterable by assigned_to, status)
//   GET    /api/tasks/:id                - Get task detail
//   POST   /api/tasks/:id/assign         - Assign task to a user
//   POST   /api/tasks/:id/accept         - Accept a task (assignee)
//   POST   /api/tasks/:id/submit         - Submit completed work
//   POST   /api/tasks/:id/verify         - Verify submitted work
//   POST   /api/tasks/:id/review         - Final review / close
//   GET    /api/tasks/:id/audit          - Retrieve audit log for a task
//   GET    /api/dashboard/sekretariat    - Dashboard summary for sekretariat role

import Task from "../models/Task.js";
import TaskAssignment from "../models/TaskAssignment.js";
import TaskLog from "../models/TaskLog.js";
import Approval from "../models/Approval.js";
import { writeAuditLog, queueNotification } from "../utils/auditLogger.js";
import { sequelize } from "../config/database.js";

// Allowed status transitions
const TRANSITIONS = {
  assign: { from: ["open"], to: "assigned" },
  accept: { from: ["assigned"], to: "accepted" },
  submit: { from: ["accepted"], to: "submitted" },
  verify: { from: ["submitted"], to: "verified" },
  review: { from: ["verified"], to: "reviewed" },
  close: { from: ["reviewed"], to: "closed" },
  reject: { from: ["assigned", "accepted", "submitted", "verified", "reviewed"], to: "rejected" },
};

function actorId(req) {
  return req.user?.id ?? req.user?.userId ?? null;
}

function ipAddress(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.socket?.remoteAddress ||
    null
  );
}

// POST /api/tasks
export async function createTask(req, res, next) {
  try {
    const actor = actorId(req);
    const { title, description, layanan_id, assigned_to, priority, sla_seconds, due_at, metadata } = req.body;

    const task = await Task.create({
      title,
      description,
      layanan_id,
      assigned_to: assigned_to ?? null,
      created_by: actor,
      priority: priority ?? "medium",
      sla_seconds: sla_seconds ?? null,
      due_at: due_at ?? null,
      metadata: metadata ?? null,
      status: assigned_to ? "assigned" : "open",
    });

    await writeAuditLog({
      module: "tasks",
      entity_id: task.id,
      action: "CREATE",
      data_old: null,
      data_new: task.toJSON(),
      actor_id: actor,
      ip_address: ipAddress(req),
    });

    if (assigned_to) {
      await queueNotification({
        recipient_id: assigned_to,
        channel: "in_app",
        subject: `Tugas baru: ${title}`,
        body: `Anda ditugaskan pada tugas "${title}".`,
        metadata: { task_id: task.id },
      });
    }

    return res.status(201).json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
}

// GET /api/tasks
export async function listTasks(req, res, next) {
  try {
    const actor = actorId(req);
    const { assigned_to, status, layanan_id } = req.query;

    const where = {};
    if (assigned_to === "me") where.assigned_to = actor;
    else if (assigned_to) where.assigned_to = Number(assigned_to);
    if (status) where.status = status;
    if (layanan_id) where.layanan_id = layanan_id;

    const tasks = await Task.findAll({ where, order: [["created_at", "DESC"]] });
    return res.json({ success: true, data: tasks });
  } catch (err) {
    next(err);
  }
}

// GET /api/tasks/:id
export async function getTask(req, res, next) {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    const logs = await TaskLog.findAll({
      where: { task_id: task.id },
      order: [["created_at", "ASC"]],
    });

    return res.json({ success: true, data: { ...task.toJSON(), logs } });
  } catch (err) {
    next(err);
  }
}

// Generic transition helper
async function transition(req, res, next, transitionName) {
  try {
    const actor = actorId(req);
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    const def = TRANSITIONS[transitionName];
    if (!def) return res.status(400).json({ success: false, message: "Unknown transition" });
    if (!def.from.includes(task.status)) {
      return res.status(422).json({
        success: false,
        message: `Cannot ${transitionName} a task with status '${task.status}'`,
      });
    }

    const data_old = task.toJSON();
    task.status = def.to;

    if (transitionName === "assign" && req.body.assigned_to) {
      task.assigned_to = req.body.assigned_to;
    }

    await task.save();

    const data_new = task.toJSON();

    // Write task_log
    await TaskLog.create({
      task_id: task.id,
      actor_id: actor,
      action: transitionName.toUpperCase(),
      from_status: data_old.status,
      to_status: data_new.status,
      notes: req.body.notes ?? null,
      data_old,
      data_new,
    });

    // Write audit_log
    await writeAuditLog({
      module: "tasks",
      entity_id: task.id,
      action: `TRANSITION_${transitionName.toUpperCase()}`,
      data_old,
      data_new,
      actor_id: actor,
      ip_address: ipAddress(req),
    });

    // Notify assignee
    if (task.assigned_to && task.assigned_to !== actor) {
      await queueNotification({
        recipient_id: task.assigned_to,
        channel: "in_app",
        subject: `Pembaruan tugas: ${task.title}`,
        body: `Status tugas "${task.title}" berubah menjadi ${def.to}.`,
        metadata: { task_id: task.id, action: transitionName },
      });
    }

    return res.json({ success: true, data: task });
  } catch (err) {
    next(err);
  }
}

// POST /api/tasks/:id/assign
export async function assignTask(req, res, next) {
  const actor = actorId(req);
  const assigned_to = req.body.assigned_to;

  if (!assigned_to) {
    return res.status(400).json({ success: false, message: "assigned_to is required" });
  }

  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: "Task not found" });

    const def = TRANSITIONS.assign;
    if (!def.from.includes(task.status)) {
      return res.status(422).json({
        success: false,
        message: `Cannot assign a task with status '${task.status}'`,
      });
    }

    await TaskAssignment.create({
      task_id: task.id,
      assigned_to,
      assigned_by: actor,
      role: req.body.role ?? null,
      assigned_at: new Date(),
    });

    return transition(req, res, next, "assign");
  } catch (err) {
    next(err);
  }
}

export const acceptTask = (req, res, next) => transition(req, res, next, "accept");
export const submitTask = (req, res, next) => transition(req, res, next, "submit");
export const verifyTask = (req, res, next) => transition(req, res, next, "verify");
export const reviewTask = (req, res, next) => transition(req, res, next, "review");

// GET /api/tasks/:id/audit
export async function getTaskAudit(req, res, next) {
  try {
    const [rows] = await sequelize.query(
      `SELECT * FROM audit_log WHERE module = 'tasks' AND entity_id = :entity_id ORDER BY created_at ASC`,
      { replacements: { entity_id: req.params.id } },
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
}

// GET /api/dashboard/sekretariat
export async function sekretariatDashboard(req, res, next) {
  try {
    const [byStatus] = await sequelize.query(
      `SELECT status, COUNT(*) as count FROM tasks GROUP BY status`,
    );
    const [overdue] = await sequelize.query(
      `SELECT COUNT(*) as count FROM tasks
       WHERE sla_seconds IS NOT NULL
         AND due_at IS NOT NULL
         AND due_at < CURRENT_TIMESTAMP
         AND status NOT IN ('closed', 'rejected')`,
    );

    return res.json({
      success: true,
      data: {
        by_status: byStatus,
        overdue: overdue[0]?.count ?? 0,
      },
    });
  } catch (err) {
    next(err);
  }
}
