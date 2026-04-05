/**
 * backend/controllers/taskController.js
 *
 * Full state machine untuk Perintah/Tugas sesuai dokumen
 * 14-alur-kerja-sekretariat-bidang-uptd.md
 *
 * Lifecycle:
 *   draft → assigned → accepted → in_progress → submitted → verified
 *        → approved_by_secretary → forwarded_to_kadin → closed
 *   Any state → rejected | escalated
 */

import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import fs from "fs";
import { Op } from "sequelize";
import Task from "../models/Task.js";
import TaskAssignment from "../models/TaskAssignment.js";
import TaskLog from "../models/TaskLog.js";
import Approval from "../models/Approval.js";
import TaskFile from "../models/TaskFile.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import sequelize from "../config/database.js";
import { logAudit } from "../services/auditLogService.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

// ─── File upload config ──────────────────────────────────────────────────────
const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "tasks");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const fileStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({
  storage: fileStorage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Jenis file tidak diizinkan"), false);
  },
});

// ─── Associations ────────────────────────────────────────────────────────────
(function ensureAssoc() {
  if (!Task.associations?.assignments)
    Task.hasMany(TaskAssignment, { foreignKey: "task_id", as: "assignments" });
  if (!Task.associations?.logs)
    Task.hasMany(TaskLog, { foreignKey: "task_id", as: "logs" });
  if (!Task.associations?.approvals)
    Task.hasMany(Approval, { foreignKey: "task_id", as: "approvals" });
  if (!Task.associations?.files)
    Task.hasMany(TaskFile, { foreignKey: "task_id", as: "files" });
  if (!Task.associations?.creator)
    Task.belongsTo(User, { foreignKey: "created_by", as: "creator" });
  if (!TaskAssignment.associations?.Task)
    TaskAssignment.belongsTo(Task, { foreignKey: "task_id" });
  if (!TaskAssignment.associations?.assignee)
    TaskAssignment.belongsTo(User, {
      foreignKey: "assignee_user_id",
      as: "assignee",
    });
  if (!TaskLog.associations?.Task)
    TaskLog.belongsTo(Task, { foreignKey: "task_id" });
  if (!Approval.associations?.Task)
    Approval.belongsTo(Task, { foreignKey: "task_id" });
  if (!Approval.associations?.approver)
    Approval.belongsTo(User, {
      foreignKey: "approver_user_id",
      as: "approver",
    });
})();

// ─── State machine ───────────────────────────────────────────────────────────
const TRANSITIONS = {
  assign: {
    // `accepted`: penanggung jawab sudah terima; masih boleh delegasi ke bawah
    // (status tugas kembali ke `assigned` untuk penerima berikutnya).
    from: ["draft", "assigned", "accepted"],
    to: "assigned",
    roles: [
      "sekretaris",
      "kepala_bidang",
      "kasubbag",
      "kasubbag_umum",
      "kasubbag_kepegawaian",
      "kasubag_umum_kepegawaian",
      "kasubag",
      "super_admin",
    ],
  },
  accept: { from: ["assigned"], to: "accepted", roles: null },
  reject_assignment: { from: ["assigned"], to: "draft", roles: null },
  start: { from: ["accepted"], to: "in_progress", roles: null },
  submit: {
    from: ["in_progress"],
    to: "submitted",
    roles: [
      "pelaksana",
      "bendahara",
      "fungsional",
      "fungsional_analis",
      "kasubbag",
      "kasubbag_umum",
      "super_admin",
    ],
  },
  verify: {
    from: ["submitted"],
    to: "verified",
    roles: [
      "fungsional",
      "fungsional_analis",
      "kepala_bidang",
      "kasubbag",
      "sekretaris",
      "super_admin",
    ],
  },
  verify_reject: {
    from: ["submitted"],
    to: "in_progress",
    roles: [
      "fungsional",
      "fungsional_analis",
      "kepala_bidang",
      "kasubbag",
      "sekretaris",
      "super_admin",
    ],
  },
  review: {
    from: ["verified"],
    to: "approved_by_secretary",
    roles: ["sekretaris", "super_admin"],
  },
  review_back: {
    from: ["verified"],
    to: "in_progress",
    roles: ["sekretaris", "super_admin"],
  },
  forward: {
    from: ["approved_by_secretary"],
    to: "forwarded_to_kadin",
    roles: ["sekretaris", "super_admin"],
  },
  close: {
    from: [
      "approved_by_secretary",
      "forwarded_to_kadin",
      "verified",
      "submitted",
    ],
    to: "closed",
    roles: ["sekretaris", "kepala_dinas", "super_admin"],
  },
  reject: {
    from: [
      "draft",
      "assigned",
      "accepted",
      "in_progress",
      "submitted",
      "verified",
    ],
    to: "rejected",
    roles: ["sekretaris", "kepala_bidang", "kepala_uptd", "super_admin"],
  },
  escalate: {
    from: [
      "draft",
      "assigned",
      "accepted",
      "in_progress",
      "submitted",
      "verified",
    ],
    to: "escalated",
    roles: ["sekretaris", "kepala_bidang", "kepala_uptd", "super_admin"],
  },
  reopen: {
    from: ["rejected", "escalated"],
    to: "draft",
    roles: ["sekretaris", "super_admin"],
  },
};

function canTransition(action, currentStatus, userRole) {
  const rule = TRANSITIONS[action];
  if (!rule) return { ok: false, reason: `Aksi '${action}' tidak dikenali` };
  if (!rule.from.includes(currentStatus))
    return {
      ok: false,
      reason: `Status '${currentStatus}' tidak dapat diubah dengan aksi '${action}'`,
    };
  if (rule.roles && !rule.roles.includes(userRole))
    return {
      ok: false,
      reason: `Role '${userRole}' tidak diizinkan melakukan aksi '${action}'`,
    };
  return { ok: true, to: rule.to };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const uid = (req) => req.user?.id ?? null;
const urole = (req) => req.user?.role ?? "guest";

async function writeAudit(taskId, aksi, old_, new_, actorId) {
  await logAudit({
    modul: "tasks",
    entitas_id: String(taskId),
    aksi,
    data_lama: old_,
    data_baru: new_,
    pegawai_id: String(actorId),
  }).catch(() => {});
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

// Generic transition handler factory
function transitionHandler(actionName, buildNote, buildNotification) {
  return async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const task = await Task.findByPk(req.params.id, { transaction: t });
      if (!task) {
        await t.rollback();
        return res
          .status(404)
          .json({ success: false, message: "Tugas tidak ditemukan" });
      }

      const { ok, reason, to } = canTransition(
        actionName,
        task.status,
        urole(req),
      );
      if (!ok) {
        await t.rollback();
        return res.status(403).json({ success: false, message: reason });
      }

      const old = task.toJSON();
      task.status = to;
      await task.save({ transaction: t });

      const note = buildNote ? buildNote(req) : null;
      await TaskLog.create(
        {
          task_id: task.id,
          actor_id: uid(req),
          action: actionName.toUpperCase(),
          note,
          data_old: old,
          data_new: task.toJSON(),
        },
        { transaction: t },
      );
      await t.commit();

      if (actionName === "close") {
        try {
          const { checkAndCompleteInstruksiIfDueAfterTaskClosed } =
            await import("../services/kadinInstruksiAutoService.js");
          await checkAndCompleteInstruksiIfDueAfterTaskClosed(task);
        } catch (_) {
          /* non-fatal */
        }
      }

      if (buildNotification) {
        const { userId, msg, link } = buildNotification(task, req);
        await notifyUser(userId, task.id, msg, link);
      }
      await writeAudit(
        task.id,
        actionName.toUpperCase(),
        old,
        task.toJSON(),
        uid(req),
      );

      return res.json({ success: true, data: task });
    } catch (err) {
      await t.rollback();
      return res.status(500).json({ success: false, error: err.message });
    }
  };
}

// ─── Routes ──────────────────────────────────────────────────────────────────

// GET /api/tasks/dashboard/summary — must be before /:id
router.get("/dashboard/summary", async (req, res) => {
  try {
    const statuses = [
      "draft",
      "assigned",
      "accepted",
      "in_progress",
      "submitted",
      "verified",
      "approved_by_secretary",
      "forwarded_to_kadin",
      "closed",
      "rejected",
      "escalated",
    ];
    const counts = {};
    await Promise.all(
      statuses.map(async (s) => {
        counts[s] = await Task.count({ where: { status: s } });
      }),
    );
    const overdue = await Task.count({
      where: {
        due_date: { [Op.lt]: new Date() },
        status: { [Op.notIn]: ["closed", "rejected"] },
      },
    }).catch(() => 0);
    return res.json({ success: true, data: { counts, overdue } });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/tasks/unit
// Dipakai oleh DashboardKasubag/DashboardKasubagUPTD/DashboardKasiUPTD (legacy UI).
// Definisi "unit tasks" dibuat longgar agar tetap kompatibel lintas modul:
// - tugas yang di-assign ke user
// - atau tugas yang dibuat oleh user
// - atau tugas yang source_unit match unit_kerja user
router.get("/unit", async (req, res) => {
  try {
    const actorId = uid(req);
    if (!actorId) return res.status(401).json({ success: false, error: "unauthenticated" });

    const unitVal = String(req.user?.unit_kerja || "").trim();
    const limitRaw = Number(req.query?.limit || 15);
    const limit = Number.isFinite(limitRaw)
      ? Math.min(Math.max(limitRaw, 1), 50)
      : 15;

    const assignedTaskIds = await TaskAssignment.findAll({
      where: { assignee_user_id: actorId },
      attributes: ["task_id"],
      order: [["created_at", "DESC"]],
      limit: 500,
    })
      .then((rows) => rows.map((r) => r.task_id))
      .catch(() => []);

    const whereOr = [
      { created_by: actorId },
      assignedTaskIds.length ? { id: { [Op.in]: assignedTaskIds } } : null,
      unitVal ? { source_unit: unitVal } : null,
    ].filter(Boolean);

    const rows = await Task.findAll({
      where: whereOr.length ? { [Op.or]: whereOr } : {},
      order: [["created_at", "DESC"]],
      limit,
    }).catch(() => []);

    return res.json({
      success: true,
      data: rows.map((t) => ({
        id: t.id,
        title: t.title,
        judul: t.title,
        status: t.status,
        due_date: t.due_date,
        created_at: t.created_at,
        source_unit: t.source_unit,
      })),
      total: rows.length,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/tasks
router.post("/", async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      title,
      description,
      module: mod,
      source_unit,
      priority,
      due_date,
      sla_seconds,
      metadata,
    } = req.body;
    if (!title)
      return res
        .status(400)
        .json({ success: false, message: "Judul tugas wajib diisi" });
    const task = await Task.create(
      {
        title,
        description,
        module: mod,
        source_unit,
        priority: priority ?? 3,
        due_date,
        sla_seconds,
        metadata,
        created_by: uid(req),
        status: "draft",
      },
      { transaction: t },
    );
    await TaskLog.create(
      {
        task_id: task.id,
        actor_id: uid(req),
        action: "CREATE",
        data_new: task.toJSON(),
      },
      { transaction: t },
    );
    await t.commit();
    await writeAudit(task.id, "CREATE", null, task.toJSON(), uid(req));
    return res.status(201).json({ success: true, data: task });
  } catch (err) {
    await t.rollback();
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/tasks
router.get("/", async (req, res) => {
  try {
    const {
      status,
      assigned_to,
      created_by,
      module: mod,
      limit = 100,
    } = req.query;
    const where = {};
    if (status) where.status = status;
    if (created_by) where.created_by = created_by;
    if (mod) where.module = mod;

    const tasks = await Task.findAll({
      where,
      include: [{ model: TaskAssignment, as: "assignments" }],
      order: [["created_at", "DESC"]],
      limit: Number(limit),
    });

    const result = assigned_to
      ? tasks.filter((t) =>
          t.assignments?.some(
            (a) => String(a.assignee_user_id) === String(assigned_to),
          ),
        )
      : tasks;

    return res.json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/tasks/:id
router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [
        {
          model: TaskAssignment,
          as: "assignments",
          include: [
            {
              model: User,
              as: "assignee",
              attributes: ["id", "nama_lengkap", "username", "role"],
            },
          ],
        },
        { model: TaskLog, as: "logs" },
        { model: Approval, as: "approvals" },
        { model: TaskFile, as: "files" },
        {
          model: User,
          as: "creator",
          attributes: ["id", "nama_lengkap", "username"],
        },
      ],
    });
    if (!task)
      return res
        .status(404)
        .json({ success: false, message: "Tugas tidak ditemukan" });
    return res.json({ success: true, data: task });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/tasks/:id/assign
router.post("/:id/assign", async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { assignee_user_id, assignee_role, note, due_date, tanggal_penugasan } =
      req.body;
    const task = await Task.findByPk(req.params.id, { transaction: t });
    if (!task) {
      await t.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Tugas tidak ditemukan" });
    }

    const { ok, reason, to } = canTransition("assign", task.status, urole(req));
    if (!ok) {
      await t.rollback();
      return res.status(403).json({ success: false, message: reason });
    }

    // ─── UPTD Dual-Track Enforcement ────────────────────────────────────────
    // Jalur A (Kasubag TU) tidak boleh assign ke Mutu/Teknis/JF/Kepala UPTD.
    // Jalur B (Kasi Mutu/Teknis) hanya boleh assign ke pelaksana seksi masing-masing.
    const actorUnit = String(req.user?.unit_kerja || "").toLowerCase();
    const actorRole = String(req.user?.role || req.user?.roleName || "").toLowerCase();
    if (actorUnit.includes("uptd")) {
      const assigneeUser = await User.findByPk(assignee_user_id, {
        transaction: t,
      }).catch(() => null);
      if (!assigneeUser) {
        await t.rollback();
        return res
          .status(400)
          .json({ success: false, message: "Assignee tidak ditemukan" });
      }
      const assUnit = String(assigneeUser.unit_kerja || "").toLowerCase();
      const assRole = String(assigneeUser.role || "").toLowerCase();

      const isKasubagTu =
        actorRole.includes("kasubag_uptd") ||
        actorRole.includes("subbag_tata_usaha") ||
        actorRole.includes("kasubbag_tata_usaha") ||
        actorRole.includes("tata_usaha");
      const isKasiMutu = actorRole.includes("mutu") || actorRole.includes("seksi_manajemen_mutu");
      const isKasiTeknis = actorRole.includes("teknis") || actorRole.includes("seksi_manajemen_teknis");

      if (isKasubagTu) {
        const okTarget = assUnit.includes("uptd_tu") && (assRole === "pelaksana" || assRole === "staf_pelaksana");
        if (!okTarget) {
          await t.rollback();
          return res.status(403).json({
            success: false,
            message: "Kasubag TU UPTD hanya dapat assign ke Pelaksana TU (jalur administratif).",
            code: "UPTD_DUAL_TRACK_VIOLATION",
          });
        }
      }

      if (isKasiMutu) {
        const okTarget = assUnit.includes("uptd_mutu") && (assRole === "pelaksana" || assRole === "staf_pelaksana");
        if (!okTarget) {
          await t.rollback();
          return res.status(403).json({
            success: false,
            message: "Kasi Mutu hanya dapat assign ke Pelaksana Mutu.",
            code: "UPTD_SEKSI_SCOPE_VIOLATION",
          });
        }
      }

      if (isKasiTeknis) {
        const okTarget = assUnit.includes("uptd_teknis") && (assRole === "pelaksana" || assRole === "staf_pelaksana");
        if (!okTarget) {
          await t.rollback();
          return res.status(403).json({
            success: false,
            message: "Kasi Teknis hanya dapat assign ke Pelaksana Teknis.",
            code: "UPTD_SEKSI_SCOPE_VIOLATION",
          });
        }
      }
    }

    const old = task.toJSON();
    task.status = to;

    if (due_date != null && String(due_date).trim() !== "") {
      const d = new Date(due_date);
      if (!Number.isNaN(d.getTime())) task.due_date = d;
    }

    const meta = { ...(task.metadata || {}) };
    const tglRaw =
      tanggal_penugasan != null && String(tanggal_penugasan).trim() !== ""
        ? String(tanggal_penugasan).trim()
        : new Date().toISOString().slice(0, 10);
    meta.surat_tugas_ke_pelaksana = {
      ...(meta.surat_tugas_ke_pelaksana || {}),
      tanggal_penugasan: tglRaw,
      dicatat_pada: new Date().toISOString(),
      assigned_by_user_id: uid(req),
      catatan_kasubag: note ? String(note).slice(0, 2000) : null,
    };
    task.metadata = meta;

    await task.save({ transaction: t });

    const assignment = await TaskAssignment.create(
      {
        task_id: task.id,
        assignee_user_id,
        assignee_role,
        assigned_by: uid(req),
        status: "assigned",
      },
      { transaction: t },
    );
    await TaskLog.create(
      {
        task_id: task.id,
        actor_id: uid(req),
        action: "ASSIGN",
        note: note || null,
        data_old: old,
        data_new: task.toJSON(),
      },
      { transaction: t },
    );
    await t.commit();

    await notifyUser(
      assignee_user_id,
      task.id,
      `Anda mendapat tugas baru: "${task.title}"`,
      `/tasks/${task.id}`,
    );
    await writeAudit(task.id, "ASSIGN", old, task.toJSON(), uid(req));
    return res.json({ success: true, data: { task, assignment } });
  } catch (err) {
    await t.rollback();
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/tasks/:id/accept
router.post("/:id/accept", async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const task = await Task.findByPk(req.params.id, { transaction: t });
    if (!task) {
      await t.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Tugas tidak ditemukan" });
    }

    const { ok, reason, to } = canTransition("accept", task.status, urole(req));
    if (!ok) {
      await t.rollback();
      return res.status(403).json({ success: false, message: reason });
    }

    const old = task.toJSON();
    task.status = to;
    await task.save({ transaction: t });
    await TaskAssignment.update(
      { status: "accepted", accepted_at: new Date() },
      {
        where: { task_id: task.id, assignee_user_id: uid(req) },
        transaction: t,
      },
    );
    await TaskLog.create(
      {
        task_id: task.id,
        actor_id: uid(req),
        action: "ACCEPT",
        data_old: old,
        data_new: task.toJSON(),
      },
      { transaction: t },
    );
    await t.commit();

    await notifyUser(
      task.created_by,
      task.id,
      `Tugas "${task.title}" diterima oleh assignee`,
      `/tasks/${task.id}`,
    );
    await writeAudit(task.id, "ACCEPT", old, task.toJSON(), uid(req));
    return res.json({ success: true, data: task });
  } catch (err) {
    await t.rollback();
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/tasks/:id/reject-assignment
router.post("/:id/reject-assignment", async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { note } = req.body;
    const task = await Task.findByPk(req.params.id, { transaction: t });
    if (!task) {
      await t.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Tugas tidak ditemukan" });
    }

    const { ok, reason, to } = canTransition(
      "reject_assignment",
      task.status,
      urole(req),
    );
    if (!ok) {
      await t.rollback();
      return res.status(403).json({ success: false, message: reason });
    }

    const old = task.toJSON();
    task.status = to;
    await task.save({ transaction: t });
    await TaskAssignment.update(
      { status: "rejected", rejected_at: new Date() },
      {
        where: { task_id: task.id, assignee_user_id: uid(req) },
        transaction: t,
      },
    );
    await TaskLog.create(
      {
        task_id: task.id,
        actor_id: uid(req),
        action: "REJECT_ASSIGNMENT",
        note: note || null,
        data_old: old,
        data_new: task.toJSON(),
      },
      { transaction: t },
    );
    await t.commit();

    await notifyUser(
      task.created_by,
      task.id,
      `Penugasan ditolak: "${task.title}". Catatan: ${note || "-"}`,
      `/tasks/${task.id}`,
    );
    await writeAudit(
      task.id,
      "REJECT_ASSIGNMENT",
      old,
      task.toJSON(),
      uid(req),
    );
    return res.json({ success: true, data: task });
  } catch (err) {
    await t.rollback();
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Simple transition handlers using factory
router.post(
  "/:id/start",
  transitionHandler("start", null, (task) => ({
    userId: task.created_by,
    msg: `Pengerjaan tugas "${task.title}" dimulai`,
    link: `/tasks/${task.id}`,
  })),
);

// POST /api/tasks/:id/submit
// BL-002 fix: enforce content validation at this layer (not only pelaksanaSekretariat controller).
// Rationale: preventing bypass via direct API call without UI validation.
router.post("/:id/submit", async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const task = await Task.findByPk(req.params.id, { transaction: t });
    if (!task) {
      await t.rollback();
      return res.status(404).json({ success: false, message: "Tugas tidak ditemukan" });
    }

    const { ok, reason, to } = canTransition("submit", task.status, urole(req));
    if (!ok) {
      await t.rollback();
      return res.status(403).json({ success: false, message: reason });
    }

    // ── Content validation (mirrors pelaksanaSekretariat/tugasController.js) ──
    const ringkas = String(req.body.output_ringkas || req.body.note || "").trim();
    if (ringkas.length < 50) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        code: "OUTPUT_TOO_SHORT",
        message:
          "Ringkasan hasil minimal 50 karakter. Jelaskan konkret apa yang sudah disiapkan sesuai perintah.",
      });
    }

    const urlStr = String(req.body.output_url || "").trim();
    const titleNeedUrl = /asn|data\s*asn|kepegawaian/i.test(String(task.title || ""));
    if (titleNeedUrl && urlStr.length < 8) {
      await t.rollback();
      return res.status(400).json({
        success: false,
        code: "URL_REQUIRED",
        message:
          "Untuk tugas terkait Data ASN/kepegawaian, isi tautan lampiran atau lokasi berkas hasil yang sudah diunggah.",
      });
    }

    const old = task.toJSON();
    task.status = to;
    task.metadata = {
      ...(task.metadata || {}),
      pelaksana_submit: {
        output_ringkas: ringkas,
        output_url: urlStr || null,
        submitted_at: new Date().toISOString(),
        submitted_by: uid(req),
      },
    };
    await task.save({ transaction: t });
    await TaskLog.create(
      {
        task_id: task.id,
        actor_id: uid(req),
        action: "SUBMIT",
        note: ringkas.slice(0, 500),
        data_old: old,
        data_new: task.toJSON(),
      },
      { transaction: t },
    );
    await t.commit();

    await notifyUser(
      task.created_by,
      task.id,
      `Tugas "${task.title}" disubmit untuk diverifikasi`,
      `/tasks/${task.id}`,
    );
    await writeAudit(task.id, "SUBMIT", old, task.toJSON(), uid(req));
    return res.json({ success: true, data: task });
  } catch (err) {
    await t.rollback();
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/tasks/:id/verify
router.post("/:id/verify", async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { decision = "approve", note } = req.body;
    const action = decision === "reject" ? "verify_reject" : "verify";
    const task = await Task.findByPk(req.params.id, { transaction: t });
    if (!task) {
      await t.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Tugas tidak ditemukan" });
    }

    const { ok, reason, to } = canTransition(action, task.status, urole(req));
    if (!ok) {
      await t.rollback();
      return res.status(403).json({ success: false, message: reason });
    }

    const old = task.toJSON();
    task.status = to;
    await task.save({ transaction: t });
    await Approval.create(
      {
        task_id: task.id,
        approver_role: urole(req),
        approver_user_id: uid(req),
        decision: decision === "reject" ? "rejected" : "approved",
        note: note || null,
        decided_at: new Date(),
      },
      { transaction: t },
    );
    await TaskLog.create(
      {
        task_id: task.id,
        actor_id: uid(req),
        action: decision === "reject" ? "VERIFY_REJECT" : "VERIFY",
        note: note || null,
        data_old: old,
        data_new: task.toJSON(),
      },
      { transaction: t },
    );
    await t.commit();

    const msg =
      decision === "reject"
        ? `Verifikasi ditolak untuk "${task.title}": ${note || "-"}`
        : `Tugas "${task.title}" terverifikasi, menunggu review Sekretaris`;
    await notifyUser(task.created_by, task.id, msg, `/tasks/${task.id}`);
    await writeAudit(
      task.id,
      decision === "reject" ? "VERIFY_REJECT" : "VERIFY",
      old,
      task.toJSON(),
      uid(req),
    );
    return res.json({ success: true, data: task });
  } catch (err) {
    await t.rollback();
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/tasks/:id/review
router.post("/:id/review", async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { decision = "approve", note } = req.body; // approve | back | forward
    const actionMap = {
      approve: "review",
      back: "review_back",
      forward: "forward",
    };
    const action = actionMap[decision] || "review";
    const task = await Task.findByPk(req.params.id, { transaction: t });
    if (!task) {
      await t.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Tugas tidak ditemukan" });
    }

    const { ok, reason, to } = canTransition(action, task.status, urole(req));
    if (!ok) {
      await t.rollback();
      return res.status(403).json({ success: false, message: reason });
    }

    const old = task.toJSON();
    task.status = to;
    await task.save({ transaction: t });
    await Approval.create(
      {
        task_id: task.id,
        approver_role: "sekretaris",
        approver_user_id: uid(req),
        decision: decision === "back" ? "rejected" : "approved",
        note: note || null,
        decided_at: new Date(),
      },
      { transaction: t },
    );
    await TaskLog.create(
      {
        task_id: task.id,
        actor_id: uid(req),
        action: `REVIEW_${decision.toUpperCase()}`,
        note: note || null,
        data_old: old,
        data_new: task.toJSON(),
      },
      { transaction: t },
    );
    await t.commit();

    const msg =
      decision === "back"
        ? `Tugas "${task.title}" dikembalikan untuk revisi: ${note || "-"}`
        : `Tugas "${task.title}" disetujui Sekretaris`;
    await notifyUser(task.created_by, task.id, msg, `/tasks/${task.id}`);
    await writeAudit(
      task.id,
      `REVIEW_${decision.toUpperCase()}`,
      old,
      task.toJSON(),
      uid(req),
    );
    return res.json({ success: true, data: task });
  } catch (err) {
    await t.rollback();
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/tasks/:id/close
router.post(
  "/:id/close",
  transitionHandler(
    "close",
    (req) => req.body.note || null,
    (task) => ({
      userId: task.created_by,
      msg: `Tugas "${task.title}" telah ditutup`,
      link: `/tasks/${task.id}`,
    }),
  ),
);

// POST /api/tasks/:id/reject
router.post(
  "/:id/reject",
  transitionHandler(
    "reject",
    (req) => req.body.note || null,
    (task, req) => ({
      userId: task.created_by,
      msg: `Tugas "${task.title}" ditolak: ${req.body.note || "-"}`,
      link: `/tasks/${task.id}`,
    }),
  ),
);

// POST /api/tasks/:id/escalate
router.post(
  "/:id/escalate",
  transitionHandler(
    "escalate",
    (req) => req.body.note || null,
    (task, req) => ({
      userId: task.created_by,
      msg: `Tugas "${task.title}" dieskalasiasi: ${req.body.note || "-"}`,
      link: `/tasks/${task.id}`,
    }),
  ),
);

// POST /api/tasks/:id/reopen
router.post("/:id/reopen", transitionHandler("reopen", null, null));

// POST /api/tasks/:id/files
router.post("/:id/files", upload.array("files", 5), async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);
    if (!task)
      return res
        .status(404)
        .json({ success: false, message: "Tugas tidak ditemukan" });
    const saved = [];
    for (const file of req.files || []) {
      const buf = fs.readFileSync(file.path);
      const hash = crypto.createHash("sha256").update(buf).digest("hex");
      const tf = await TaskFile.create({
        task_id: task.id,
        file_name: file.originalname,
        file_path: file.path.replace(/\\/g, "/"),
        file_type: file.mimetype,
        file_size: file.size,
        uploaded_by: uid(req),
        file_hash: hash,
      });
      saved.push(tf);
    }
    await TaskLog.create({
      task_id: task.id,
      actor_id: uid(req),
      action: "UPLOAD_FILE",
      data_new: { files: saved.map((f) => f.file_name) },
    });
    return res.json({ success: true, data: saved });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/tasks/:id/files/:fileId
router.get("/:id/files/:fileId", async (req, res) => {
  try {
    const tf = await TaskFile.findOne({
      where: { id: req.params.fileId, task_id: req.params.id },
    });
    if (!tf)
      return res
        .status(404)
        .json({ success: false, message: "File tidak ditemukan" });
    return res.download(tf.file_path, tf.file_name);
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
