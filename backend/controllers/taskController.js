const express = require("express");
const {
  Task,
  TaskAssignment,
  TaskLog,
  Approval,
  sequelize,
} = require("../models");
const auditLogger = require("../utils/auditLogger");

const router = express.Router();

// helper to get current user from request (assumes auth middleware sets req.user)
function currentUserId(req) {
  return req.user?.id || req.user?.pegawai_id || null;
}

// Create task
router.post("/", async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const payload = req.body;
    payload.created_by = currentUserId(req);
    const task = await Task.create(payload, { transaction: t });

    await TaskLog.create(
      {
        task_id: task.id,
        actor_id: payload.created_by,
        action: "CREATE",
        note: payload.title || null,
        data_new: payload,
      },
      { transaction: t },
    );

    // write audit log
    await auditLogger(sequelize, {
      modul: "tasks",
      entitas_id: String(task.id),
      aksi: "CREATE",
      data_lama: null,
      data_baru: payload,
      pegawai_id: String(payload.created_by),
    });

    await t.commit();
    return res.status(201).json({ success: true, data: task });
  } catch (err) {
    await t.rollback();
    console.error(err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// List tasks with filters
router.get("/", async (req, res) => {
  try {
    const { status, role, assigned_to } = req.query;
    const where = {};
    if (status) where.status = status;
    if (assigned_to) where.created_by = assigned_to;

    const tasks = await Task.findAll({ where, limit: 200 });
    return res.json({ success: true, data: tasks });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Task detail + logs
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const task = await Task.findByPk(id, {
      include: [
        { model: TaskAssignment },
        { model: TaskLog },
        { model: Approval },
      ],
    });
    if (!task)
      return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: task });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// assign task
router.post("/:id/assign", async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const id = req.params.id;
    const { assignee_role, assignee_user_id } = req.body;
    const assign = await TaskAssignment.create(
      {
        task_id: id,
        assignee_role,
        assignee_user_id,
        assigned_by: currentUserId(req),
      },
      { transaction: t },
    );

    await TaskLog.create(
      {
        task_id: id,
        actor_id: currentUserId(req),
        action: "ASSIGN",
        note: `Assigned to role=${assignee_role} user=${assignee_user_id || "null"}`,
        data_new: assign,
      },
      { transaction: t },
    );

    await auditLogger(sequelize, {
      modul: "tasks",
      entitas_id: String(id),
      aksi: "ASSIGN",
      data_lama: null,
      data_baru: assign,
      pegawai_id: String(currentUserId(req)),
    });

    await t.commit();
    return res.json({ success: true, data: assign });
  } catch (err) {
    await t.rollback();
    return res.status(500).json({ success: false, error: err.message });
  }
});

// transition: start/submit/verify/close
router.post("/:id/transition", async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const id = req.params.id;
    const { action, note } = req.body;
    const task = await Task.findByPk(id, { transaction: t });
    if (!task)
      return res.status(404).json({ success: false, message: "Not found" });

    const old = task.toJSON();

    // map actions to statuses (simple)
    let newStatus = task.status;
    if (action === "start") newStatus = "in_progress";
    if (action === "submit") newStatus = "submitted";
    if (action === "verify") newStatus = "verified";
    if (action === "close") newStatus = "closed";

    task.status = newStatus;
    await task.save({ transaction: t });

    await TaskLog.create(
      {
        task_id: id,
        actor_id: currentUserId(req),
        action: action.toUpperCase(),
        note: note || null,
        data_old: old,
        data_new: task.toJSON(),
      },
      { transaction: t },
    );

    await auditLogger(sequelize, {
      modul: "tasks",
      entitas_id: String(id),
      aksi: action.toUpperCase(),
      data_lama: old,
      data_baru: task.toJSON(),
      pegawai_id: String(currentUserId(req)),
    });

    await t.commit();
    return res.json({ success: true, data: task });
  } catch (err) {
    await t.rollback();
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
