/**
 * backend/controllers/taskController.js
 *
 * Handles Task Workflow endpoints for Sekretariat:
 *   POST   /api/tasks              - create task
 *   GET    /api/tasks              - list tasks (filter by role/status/assignee)
 *   GET    /api/tasks/:id          - get task detail + logs
 *   POST   /api/tasks/:id/assign   - assign task to role/user
 *   POST   /api/tasks/:id/transition - change task status
 */
import { Op } from "sequelize";
import Task from "../models/Task.js";
import TaskAssignment from "../models/TaskAssignment.js";
import TaskLog from "../models/TaskLog.js";
import TaskApproval from "../models/TaskApproval.js";
import writeAuditLog from "../utils/auditLogger.js";

// Allowed status transitions per actor role
const TRANSITIONS = {
  draft:       { next: ["assigned"],    allowedRoles: ["sekretaris", "kasubag_umum", "super_admin"] },
  assigned:    { next: ["in_progress"], allowedRoles: ["sekretaris", "kasubag_umum", "jabatan_fungsional", "pelaksana", "bendahara", "super_admin"] },
  in_progress: { next: ["submitted"],   allowedRoles: ["pelaksana", "bendahara", "jabatan_fungsional", "kasubag_umum", "super_admin"] },
  submitted:   { next: ["verified", "in_progress"], allowedRoles: ["sekretaris", "kasubag_umum", "super_admin"] },
  verified:    { next: ["closed"],      allowedRoles: ["sekretaris", "super_admin"] },
  closed:      { next: [],             allowedRoles: [] },
};

// Roles that are considered part of Sekretariat
const SEKRETARIAT_ROLES = ["sekretaris", "kasubag_umum", "jabatan_fungsional", "pelaksana", "bendahara", "super_admin"];

/**
 * POST /api/tasks
 * Body: { title, description, modul_id, layanan_id, priority, due_date, is_sensitive, assignee_role }
 */
export async function createTask(req, res) {
  try {
    const userId = req.user?.id;
    const { title, description, modul_id, layanan_id, priority, due_date, is_sensitive, assignee_role } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: "Judul tugas wajib diisi" });
    }

    const task = await Task.create({
      title,
      description: description || null,
      modul_id: modul_id || null,
      layanan_id: layanan_id || null,
      created_by: userId,
      status: assignee_role ? "assigned" : "draft",
      priority: priority || "medium",
      due_date: due_date || null,
      is_sensitive: is_sensitive === true || is_sensitive === "true" || false,
    });

    // Create initial TaskLog
    await TaskLog.create({
      task_id: task.id,
      actor_id: userId,
      action: "CREATE",
      note: `Tugas dibuat oleh ${req.user?.nama_lengkap || req.user?.username || userId}`,
      data_old: null,
      data_new: task.toJSON(),
    });

    // Auto-assign if assignee_role provided
    if (assignee_role) {
      await TaskAssignment.create({
        task_id: task.id,
        assignee_role,
        assignee_user_id: null,
        assigned_by: userId,
        assigned_at: new Date(),
        status: "pending",
      });

      await TaskLog.create({
        task_id: task.id,
        actor_id: userId,
        action: "ASSIGN",
        note: `Ditugaskan ke role: ${assignee_role}`,
        data_old: null,
        data_new: { assignee_role },
      });
    }

    // Write audit log
    await writeAuditLog({
      modul: "tasks",
      entitasId: task.id,
      aksi: "CREATE",
      dataLama: null,
      dataBaru: task.toJSON(),
      pegawaiId: userId,
    });

    return res.status(201).json({ success: true, data: task });
  } catch (err) {
    console.error("[taskController.createTask]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/tasks
 * Query: role, assigned_to, status, modul_id
 */
export async function listTasks(req, res) {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { role, assigned_to, status, modul_id } = req.query;

    const where = {};

    if (status) where.status = status;
    if (modul_id) where.modul_id = modul_id;

    // Restrict to tasks created by the user or assigned to user's role
    if (userRole !== "super_admin" && userRole !== "sekretaris") {
      // Non-sekretaris roles see only tasks assigned to their role or created by them
      const assignments = await TaskAssignment.findAll({
        where: { assignee_role: role || userRole },
        attributes: ["task_id"],
      });
      const assignedTaskIds = assignments.map((a) => a.task_id);
      where[Op.or] = [
        { id: { [Op.in]: assignedTaskIds } },
        { created_by: userId },
      ];
    }

    // Filter by target role (for approval queue etc.)
    if (role && (userRole === "sekretaris" || userRole === "super_admin")) {
      const assignments = await TaskAssignment.findAll({
        where: { assignee_role: role },
        attributes: ["task_id"],
      });
      const assignedTaskIds = assignments.map((a) => a.task_id);
      where.id = { [Op.in]: assignedTaskIds };
    }

    const tasks = await Task.findAll({
      where,
      order: [["created_at", "DESC"]],
    });

    return res.json({ success: true, data: tasks, count: tasks.length });
  } catch (err) {
    console.error("[taskController.listTasks]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /api/tasks/:id
 */
export async function getTask(req, res) {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: "Tugas tidak ditemukan" });

    const [logs, assignments, approvals] = await Promise.all([
      TaskLog.findAll({ where: { task_id: task.id }, order: [["created_at", "ASC"]] }),
      TaskAssignment.findAll({ where: { task_id: task.id } }),
      TaskApproval.findAll({ where: { task_id: task.id } }),
    ]);

    return res.json({ success: true, data: { ...task.toJSON(), logs, assignments, approvals } });
  } catch (err) {
    console.error("[taskController.getTask]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/tasks/:id/assign
 * Body: { assignee_role, assignee_user_id }
 */
export async function assignTask(req, res) {
  try {
    const userId = req.user?.id;
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: "Tugas tidak ditemukan" });

    const { assignee_role, assignee_user_id } = req.body;
    if (!assignee_role) {
      return res.status(400).json({ success: false, message: "assignee_role wajib diisi" });
    }

    const oldData = task.toJSON();

    const assignment = await TaskAssignment.create({
      task_id: task.id,
      assignee_role,
      assignee_user_id: assignee_user_id || null,
      assigned_by: userId,
      assigned_at: new Date(),
      status: "pending",
    });

    // Update task status to assigned
    if (task.status === "draft") {
      await task.update({ status: "assigned" });
    }

    await TaskLog.create({
      task_id: task.id,
      actor_id: userId,
      action: "ASSIGN",
      note: `Ditugaskan ke role: ${assignee_role}${assignee_user_id ? ` (user: ${assignee_user_id})` : ""}`,
      data_old: oldData,
      data_new: { assignee_role, assignee_user_id, status: task.status },
    });

    await writeAuditLog({
      modul: "task_assignments",
      entitasId: task.id,
      aksi: "ASSIGN",
      dataLama: oldData,
      dataBaru: assignment.toJSON(),
      pegawaiId: userId,
    });

    return res.status(201).json({ success: true, data: assignment });
  } catch (err) {
    console.error("[taskController.assignTask]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * POST /api/tasks/:id/transition
 * Body: { to_status, note }
 */
export async function transitionTask(req, res) {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const task = await Task.findByPk(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: "Tugas tidak ditemukan" });

    const { to_status, note } = req.body;
    if (!to_status) {
      return res.status(400).json({ success: false, message: "to_status wajib diisi" });
    }

    const transitionRule = TRANSITIONS[task.status];
    if (!transitionRule) {
      return res.status(400).json({ success: false, message: `Status saat ini tidak valid: ${task.status}` });
    }

    if (!transitionRule.next.includes(to_status)) {
      return res.status(400).json({
        success: false,
        message: `Transisi dari '${task.status}' ke '${to_status}' tidak diizinkan`,
      });
    }

    if (!transitionRule.allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Role '${userRole}' tidak memiliki izin untuk transisi ini`,
      });
    }

    const oldData = task.toJSON();
    await task.update({ status: to_status });

    // If status is "submitted", create an approval record
    if (to_status === "submitted") {
      await TaskApproval.create({
        task_id: task.id,
        approver_role: "sekretaris",
        approver_user_id: null,
        decision: null,
        note: null,
        decided_at: null,
      });
    }

    // If verifying, record the decision
    if (to_status === "verified" || to_status === "closed") {
      await TaskApproval.update(
        { decision: to_status === "verified" ? "approved" : "closed", decided_at: new Date(), note: note || null },
        { where: { task_id: task.id, decision: null } },
      );
    }

    await TaskLog.create({
      task_id: task.id,
      actor_id: userId,
      action: `TRANSITION_${to_status.toUpperCase()}`,
      note: note || `Status berubah dari ${oldData.status} ke ${to_status}`,
      data_old: oldData,
      data_new: { ...oldData, status: to_status },
    });

    await writeAuditLog({
      modul: "tasks",
      entitasId: task.id,
      aksi: `TRANSITION_${to_status.toUpperCase()}`,
      dataLama: oldData,
      dataBaru: { ...oldData, status: to_status },
      pegawaiId: userId,
    });

    return res.json({ success: true, data: await Task.findByPk(task.id) });
  } catch (err) {
    console.error("[taskController.transitionTask]", err);
    return res.status(500).json({ success: false, message: err.message });
  }
}
