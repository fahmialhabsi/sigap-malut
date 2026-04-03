import { Op } from "sequelize";
import sequelize from "../config/database.js";
import Task from "../models/Task.js";
import TaskAssignment from "../models/TaskAssignment.js";
import TaskLog from "../models/TaskLog.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";

const COORDINATION_APP = "executive_coordination";
const COORDINATION_KINDS = new Set(["perintah", "koordinasi"]);
const SEKRETARIS_SUBORDINATE_ROLES = new Set([
  "kasubag_umum_kepegawaian",
  "fungsional_perencanaan",
  "fungsional_keuangan",
  "bendahara_pengeluaran",
  "bendahara_gaji",
  "bendahara_barang",
]);
const SEKRETARIS_PEER_ROLES = new Set([
  "kepala_bidang_ketersediaan",
  "kepala_bidang_distribusi",
  "kepala_bidang_konsumsi",
  "kepala_uptd",
]);
const SUPPORTED_ROLES = new Set([
  "sekretaris",
  "super_admin",
  ...SEKRETARIS_SUBORDINATE_ROLES,
  ...SEKRETARIS_PEER_ROLES,
]);

const ROLE_LABELS = {
  sekretaris: "Sekretaris",
  kasubag_umum_kepegawaian: "Kasubag Umum & Kepegawaian",
  fungsional_perencanaan: "Fungsional Perencanaan",
  fungsional_keuangan: "Fungsional Keuangan / PPK",
  bendahara_pengeluaran: "Bendahara Pengeluaran",
  bendahara_gaji: "Bendahara Gaji",
  bendahara_barang: "Bendahara Barang",
  kepala_bidang_ketersediaan: "Kepala Bidang Ketersediaan",
  kepala_bidang_distribusi: "Kepala Bidang Distribusi",
  kepala_bidang_konsumsi: "Kepala Bidang Konsumsi",
  kepala_uptd: "Kepala UPTD Balai Pengawasan",
  super_admin: "Super Admin",
};

function normalizeRole(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function normalizeUnit(value) {
  return String(value || "").trim().toLowerCase();
}

function canonicalRoleFromUser(user) {
  const role = normalizeRole(user?.role);
  const unit = normalizeUnit(user?.unit_kerja);

  if (role === "super_admin") return "super_admin";
  if (role === "sekretaris" || role.startsWith("sekretaris")) {
    return "sekretaris";
  }
  if (
    role === "kepala_bidang_ketersediaan" ||
    (role === "kepala_bidang" && unit.includes("ketersediaan")) ||
    (role.includes("kabid") && unit.includes("ketersediaan"))
  ) {
    return "kepala_bidang_ketersediaan";
  }
  if (
    role === "kepala_bidang_distribusi" ||
    (role === "kepala_bidang" && unit.includes("distribusi")) ||
    (role.includes("kabid") && unit.includes("distribusi"))
  ) {
    return "kepala_bidang_distribusi";
  }
  if (
    role === "kepala_bidang_konsumsi" ||
    (role === "kepala_bidang" && unit.includes("konsumsi")) ||
    (role.includes("kabid") && unit.includes("konsumsi"))
  ) {
    return "kepala_bidang_konsumsi";
  }
  if (
    role === "kepala_uptd" ||
    ((role.includes("kepala") || role.includes("uptd")) && unit.includes("uptd"))
  ) {
    return "kepala_uptd";
  }
  if (
    role === "kasubag_umum_kepegawaian" ||
    role === "kasubag" ||
    role === "kasubbag" ||
    role === "kasubbag_umum" ||
    role === "kasubbag_kepegawaian" ||
    role === "kasubag_kepegawaian" ||
    ((role.startsWith("kasubag") || role.startsWith("kasubbag")) &&
      (unit.includes("sekretariat") ||
        unit.includes("kepegawaian") ||
        unit.includes("umum")))
  ) {
    return "kasubag_umum_kepegawaian";
  }
  if (
    (role === "fungsional_perencana" || role === "fungsional_perencanaan") &&
    unit.includes("sekretariat")
  ) {
    return "fungsional_perencanaan";
  }
  if (
    (role === "fungsional_keuangan" || role === "ppk") &&
    unit.includes("sekretariat")
  ) {
    return "fungsional_keuangan";
  }
  if (role === "bendahara_pengeluaran") {
    return "bendahara_pengeluaran";
  }
  if (role === "bendahara_gaji") {
    return "bendahara_gaji";
  }
  if (role === "bendahara_barang") {
    return "bendahara_barang";
  }

  return role || "";
}

function sourceUnitFromRole(role) {
  if (role === "sekretaris") return "Sekretariat";
  if (role === "kasubag_umum_kepegawaian") {
    return "Kasubag Umum & Kepegawaian";
  }
  if (role === "fungsional_perencanaan") return "JF Perencanaan Sekretariat";
  if (role === "fungsional_keuangan") return "JF Keuangan Sekretariat";
  if (role === "bendahara_pengeluaran") return "Bendahara Pengeluaran";
  if (role === "bendahara_gaji") return "Bendahara Gaji";
  if (role === "bendahara_barang") return "Bendahara Barang";
  if (role === "kepala_bidang_ketersediaan") return "Bidang Ketersediaan";
  if (role === "kepala_bidang_distribusi") return "Bidang Distribusi";
  if (role === "kepala_bidang_konsumsi") return "Bidang Konsumsi";
  if (role === "kepala_uptd") return "UPTD Balai Pengawasan";
  if (role === "super_admin") return "Super Admin";
  return role || "SIGAP Malut";
}

function resolveAudienceRoles(user) {
  const role = canonicalRoleFromUser(user);
  const roles = new Set([role]);
  if (role.startsWith("kepala_bidang_")) {
    roles.add("kepala_bidang");
  }
  return [...roles].filter(Boolean);
}

function isSupportedActor(role) {
  return SUPPORTED_ROLES.has(role);
}

function canCreateBridge(actorRole, targetRole, kind) {
  if (actorRole === "super_admin") return true;
  if (actorRole === "sekretaris") {
    if (kind === "perintah") {
      return SEKRETARIS_SUBORDINATE_ROLES.has(targetRole);
    }
    return SEKRETARIS_PEER_ROLES.has(targetRole);
  }
  if (
    SEKRETARIS_SUBORDINATE_ROLES.has(actorRole) ||
    SEKRETARIS_PEER_ROLES.has(actorRole)
  ) {
    return kind === "koordinasi" && targetRole === "sekretaris";
  }
  return false;
}

function normalizePriority(value) {
  const n = Number(value);
  if ([1, 2, 3, 4].includes(n)) return n;
  return 3;
}

function isCoordinationTask(task) {
  const meta = task?.metadata || {};
  return meta.app === COORDINATION_APP;
}

function ensureAssoc() {
  if (!Task.associations?.assignments) {
    Task.hasMany(TaskAssignment, { foreignKey: "task_id", as: "assignments" });
  }
  if (!Task.associations?.creator) {
    Task.belongsTo(User, { foreignKey: "created_by", as: "creator" });
  }
  if (!TaskAssignment.associations?.assignee) {
    TaskAssignment.belongsTo(User, {
      foreignKey: "assignee_user_id",
      as: "assignee",
    });
  }
}

async function resolveTargetUserId(targetRole) {
  const users = await User.findAll({
    where: { is_active: true },
    attributes: [
      "id",
      "username",
      "email",
      "nama_lengkap",
      "role",
      "unit_kerja",
    ],
    order: [["id", "ASC"]],
  });

  const match = users.find((user) => canonicalRoleFromUser(user) === targetRole);
  return match?.id || null;
}

async function notifyUser(targetUserId, taskId, message) {
  if (!targetUserId) return;
  await Notification.create({
    target_user_id: targetUserId,
    task_id: taskId,
    message,
    link: `/tasks/${taskId}`,
  }).catch(() => null);
}

function canAccessAssignment(task, user) {
  const actorId = Number(user?.id);
  const roles = resolveAudienceRoles(user);
  const assignments = Array.isArray(task?.assignments) ? task.assignments : [];
  return assignments.find((assignment) => {
    const userMatch =
      assignment.assignee_user_id != null &&
      Number(assignment.assignee_user_id) === actorId;
    const roleMatch = roles.includes(normalizeRole(assignment.assignee_role));
    return userMatch || roleMatch;
  });
}

function cleanKind(value) {
  const kind = normalizeRole(value);
  return COORDINATION_KINDS.has(kind) ? kind : "koordinasi";
}

export async function createCoordination(req, res) {
  const transaction = await sequelize.transaction();

  try {
    ensureAssoc();

    const actorRole = canonicalRoleFromUser(req.user);
    if (!isSupportedActor(actorRole)) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: "Role Anda belum diizinkan memakai kanal koordinasi ini.",
      });
    }

    const {
      title,
      description,
      target_role,
      due_date,
      priority,
      kind,
      agenda,
      expected_output,
      reference,
      source_task_id,
    } = req.body || {};

    const cleanTargetRole = normalizeRole(target_role);
    const cleanCoordinationKind = cleanKind(kind);

    if (!title || !cleanTargetRole) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Field wajib: title dan target_role.",
      });
    }

    if (!canCreateBridge(actorRole, cleanTargetRole, cleanCoordinationKind)) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: "Arah koordinasi/perintah ini tidak diizinkan.",
      });
    }

    const targetUserId = await resolveTargetUserId(cleanTargetRole);
    const actorLabel = ROLE_LABELS[actorRole] || actorRole;
    const targetLabel = ROLE_LABELS[cleanTargetRole] || cleanTargetRole;

    const task = await Task.create(
      {
        title,
        description: description || null,
        created_by: req.user.id,
        source_unit: sourceUnitFromRole(actorRole),
        status: "assigned",
        priority: normalizePriority(priority),
        due_date: due_date ? new Date(due_date) : null,
        sumber_perintah_kadin: source_task_id ? Number(source_task_id) : null,
        metadata: {
          app: COORDINATION_APP,
          kind: cleanCoordinationKind,
          from_role: actorRole,
          from_label: actorLabel,
          to_role: cleanTargetRole,
          to_label: targetLabel,
          agenda: agenda || null,
          expected_output: expected_output || null,
          reference: reference || null,
          latest_response_note: null,
          latest_response_at: null,
          latest_response_by_role: null,
          latest_response_by_name: null,
        },
      },
      { transaction },
    );

    await TaskAssignment.create(
      {
        task_id: task.id,
        assignee_role: cleanTargetRole,
        assignee_user_id: targetUserId,
        assigned_by: req.user.id,
        status: "assigned",
      },
      { transaction },
    );

    await TaskLog.create(
      {
        task_id: task.id,
        actor_id: req.user.id,
        action:
          cleanCoordinationKind === "perintah"
            ? "CREATE_PERINTAH"
            : "CREATE_KOORDINASI",
        note: agenda || description || null,
        data_new: task.toJSON(),
      },
      { transaction },
    );

    await transaction.commit();

    await notifyUser(
      targetUserId,
      task.id,
      `${
        cleanCoordinationKind === "perintah" ? "Perintah" : "Koordinasi"
      } baru dari ${actorLabel}: "${task.title}"`,
    );

    return res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({
      success: false,
      message: "Gagal membuat koordinasi/perintah.",
      error: error.message,
    });
  }
}

export async function listCoordinationInbox(req, res) {
  try {
    ensureAssoc();

    const actorRole = canonicalRoleFromUser(req.user);
    if (!isSupportedActor(actorRole)) {
      return res.status(403).json({
        success: false,
        message: "Role Anda belum diizinkan memakai kanal koordinasi ini.",
      });
    }

    const { kind, source_role, limit = 25 } = req.query || {};
    const audienceRoles = resolveAudienceRoles(req.user);

    const assignments = await TaskAssignment.findAll({
      where: {
        [Op.or]: [
          { assignee_user_id: req.user.id },
          { assignee_role: { [Op.in]: audienceRoles } },
        ],
      },
      attributes: ["task_id"],
      order: [["assigned_at", "DESC"]],
      limit: 500,
    });

    const taskIds = [...new Set(assignments.map((row) => row.task_id))].filter(
      Boolean,
    );

    if (taskIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const rows = await Task.findAll({
      where: { id: { [Op.in]: taskIds } },
      include: [
        {
          model: TaskAssignment,
          as: "assignments",
          required: false,
          include: [
            {
              model: User,
              as: "assignee",
              attributes: [
                "id",
                "nama_lengkap",
                "username",
                "role",
                "unit_kerja",
              ],
            },
          ],
        },
        {
          model: User,
          as: "creator",
          attributes: [
            "id",
            "nama_lengkap",
            "username",
            "role",
            "unit_kerja",
          ],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: Math.min(Math.max(Number(limit) || 25, 1), 100),
    });

    const filtered = rows.filter((row) => {
      if (!isCoordinationTask(row)) return false;

      const rowKind = cleanKind(row.metadata?.kind);
      const rowSourceRole = normalizeRole(row.metadata?.from_role);
      if (kind && rowKind !== cleanKind(kind)) return false;
      if (source_role && rowSourceRole !== normalizeRole(source_role)) {
        return false;
      }

      return !!canAccessAssignment(row, req.user);
    });

    return res.json({ success: true, data: filtered });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal memuat inbox koordinasi.",
      error: error.message,
    });
  }
}

export async function listCoordinationOutbox(req, res) {
  try {
    ensureAssoc();

    const actorRole = canonicalRoleFromUser(req.user);
    if (!isSupportedActor(actorRole)) {
      return res.status(403).json({
        success: false,
        message: "Role Anda belum diizinkan memakai kanal koordinasi ini.",
      });
    }

    const { kind, target_role, limit = 25 } = req.query || {};
    const rows = await Task.findAll({
      where: { created_by: req.user.id },
      include: [
        {
          model: TaskAssignment,
          as: "assignments",
          required: false,
          include: [
            {
              model: User,
              as: "assignee",
              attributes: [
                "id",
                "nama_lengkap",
                "username",
                "role",
                "unit_kerja",
              ],
            },
          ],
        },
        {
          model: User,
          as: "creator",
          attributes: [
            "id",
            "nama_lengkap",
            "username",
            "role",
            "unit_kerja",
          ],
        },
      ],
      order: [["created_at", "DESC"]],
      limit: Math.min(Math.max(Number(limit) || 25, 1), 100),
    });

    const filtered = rows.filter((row) => {
      if (!isCoordinationTask(row)) return false;

      const rowKind = cleanKind(row.metadata?.kind);
      const rowTargetRole = normalizeRole(row.metadata?.to_role);
      if (kind && rowKind !== cleanKind(kind)) return false;
      if (target_role && rowTargetRole !== normalizeRole(target_role)) {
        return false;
      }
      return true;
    });

    return res.json({ success: true, data: filtered });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal memuat outbox koordinasi.",
      error: error.message,
    });
  }
}

export async function respondCoordination(req, res) {
  const transaction = await sequelize.transaction();

  try {
    ensureAssoc();

    const { response_note } = req.body || {};
    const cleanNote = String(response_note || "").trim();

    if (!cleanNote) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Tanggapan wajib diisi.",
      });
    }

    const row = await Task.findByPk(req.params.id, {
      include: [
        {
          model: TaskAssignment,
          as: "assignments",
          required: false,
        },
      ],
      transaction,
    });

    if (!row || !isCoordinationTask(row)) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Item koordinasi tidak ditemukan.",
      });
    }

    const assignment = canAccessAssignment(row, req.user);
    if (!assignment) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: "Anda tidak berhak menanggapi item ini.",
      });
    }

    const old = row.toJSON();
    row.status = "submitted";
    row.metadata = {
      ...(row.metadata || {}),
      latest_response_note: cleanNote,
      latest_response_at: new Date().toISOString(),
      latest_response_by_user_id: req.user?.id || null,
      latest_response_by_role: canonicalRoleFromUser(req.user),
      latest_response_by_name:
        req.user?.nama_lengkap || req.user?.username || "Pengguna",
    };
    await row.save({ transaction });

    await TaskAssignment.update(
      { status: "submitted" },
      {
        where: { id: assignment.id },
        transaction,
      },
    );

    await TaskLog.create(
      {
        task_id: row.id,
        actor_id: req.user.id,
        action: "RESPOND_COORDINATION",
        note: cleanNote,
        data_old: old,
        data_new: row.toJSON(),
      },
      { transaction },
    );

    await transaction.commit();

    await notifyUser(
      row.created_by,
      row.id,
      `Ada tanggapan baru untuk "${row.title}" dari ${
        req.user?.nama_lengkap || req.user?.username || "pengguna"
      }.`,
    );

    return res.json({ success: true, data: row });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({
      success: false,
      message: "Gagal mengirim tanggapan koordinasi.",
      error: error.message,
    });
  }
}

export async function closeCoordination(req, res) {
  const transaction = await sequelize.transaction();

  try {
    ensureAssoc();

    const row = await Task.findByPk(req.params.id, {
      include: [
        {
          model: TaskAssignment,
          as: "assignments",
          required: false,
        },
      ],
      transaction,
    });

    if (!row || !isCoordinationTask(row)) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Item koordinasi tidak ditemukan.",
      });
    }

    const assignment = canAccessAssignment(row, req.user);
    const isCreator = Number(row.created_by) === Number(req.user?.id);
    if (!assignment && !isCreator && canonicalRoleFromUser(req.user) !== "super_admin") {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: "Anda tidak berhak menutup item ini.",
      });
    }

    const old = row.toJSON();
    row.status = "closed";
    await row.save({ transaction });

    await TaskLog.create(
      {
        task_id: row.id,
        actor_id: req.user.id,
        action: "CLOSE_COORDINATION",
        note: String(req.body?.note || "").trim() || null,
        data_old: old,
        data_new: row.toJSON(),
      },
      { transaction },
    );

    await transaction.commit();

    if (row.created_by !== req.user.id) {
      await notifyUser(
        row.created_by,
        row.id,
        `Item koordinasi "${row.title}" telah ditutup.`,
      );
    }

    return res.json({ success: true, data: row });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({
      success: false,
      message: "Gagal menutup item koordinasi.",
      error: error.message,
    });
  }
}
