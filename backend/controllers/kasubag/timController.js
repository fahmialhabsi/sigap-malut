import { Op } from "sequelize";
import sequelize from "../../config/database.js";
import Task from "../../models/Task.js";
import TaskAssignment from "../../models/TaskAssignment.js";
import TaskLog from "../../models/TaskLog.js";
import Notification from "../../models/Notification.js";
import User from "../../models/User.js";
import UserHierarchy from "../../models/UserHierarchy.js";

function groupInit() {
  return { todo: [], in_progress: [], menunggu_review: [], dikembalikan: [], selesai: [] };
}

function statusToLane(status) {
  if (status === "assigned" || status === "accepted") return "todo";
  if (status === "in_progress") return "in_progress";
  if (status === "submitted") return "menunggu_review";
  if (status === "returned_to_pelaksana") return "dikembalikan";
  if (status === "closed" || status === "verified") return "selesai";
  return "todo";
}

// GET /api/kasubag/tim/kanban
export async function getTimSayaKanban(req, res) {
  try {
    const actorId = req.user?.id;
    if (!actorId) return res.status(401).json({ success: false, error: "unauthenticated" });

    // Kolom aktual DB: supervisor_id = atasan, user_id = bawahan
    const rels = await UserHierarchy.findAll({
      where: { supervisor_id: actorId },
      attributes: ["user_id"],
      limit: 500,
    }).catch(() => []);
    const bawahanIds = rels.map((r) => r.user_id);
    if (bawahanIds.length === 0) {
      return res.json({ success: true, data: { staff: [], lanes: groupInit() } });
    }

    const staff = await User.findAll({
      where: { id: { [Op.in]: bawahanIds } },
      attributes: ["id", "nama_lengkap", "username", "role", "unit_kerja"],
      order: [["nama_lengkap", "ASC"]],
    }).catch(() => []);

    const assignments = await TaskAssignment.findAll({
      where: { assignee_user_id: { [Op.in]: bawahanIds } },
      attributes: ["task_id", "assignee_user_id", "status", "accepted_at"],
      order: [["created_at", "DESC"]],
      limit: 2000,
    }).catch(() => []);
    const taskIds = Array.from(new Set(assignments.map((a) => a.task_id)));
    const tasks = await Task.findAll({
      where: { id: { [Op.in]: taskIds } },
      order: [["updated_at", "DESC"]],
      limit: 2000,
    }).catch(() => []);
    const byId = new Map(tasks.map((t) => [t.id, t]));

    const lanes = groupInit();
    for (const a of assignments) {
      const t = byId.get(a.task_id);
      if (!t) continue;
      const lane = statusToLane(t.status);
      lanes[lane].push({
        id: t.id,
        title: t.title,
        status: t.status,
        due_date: t.due_date,
        assignee_user_id: a.assignee_user_id,
        revisi_ke: t.revisi_ke ?? 0,
        catatan_verifikasi: t.catatan_verifikasi ?? null,
        updated_at: t.updated_at,
      });
    }

    for (const k of Object.keys(lanes)) {
      lanes[k] = lanes[k].slice(0, 50);
    }

    return res.json({ success: true, data: { staff, lanes } });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// GET /api/kasubag/tim/anggota
// Mengembalikan daftar pelaksana yang berada di bawah Kasubag ini (untuk dropdown form).
export async function getTimAnggota(req, res) {
  try {
    const actorId = req.user?.id;
    if (!actorId) return res.status(401).json({ success: false, error: "unauthenticated" });

    const rels = await UserHierarchy.findAll({
      where: { supervisor_id: actorId },
      attributes: ["user_id"],
      limit: 200,
    }).catch(() => []);
    const bawahanIds = rels.map((r) => r.user_id);
    if (bawahanIds.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const staff = await User.findAll({
      where: { id: { [Op.in]: bawahanIds }, is_active: true },
      attributes: ["id", "nama_lengkap", "username", "role", "unit_kerja", "jabatan"],
      order: [["nama_lengkap", "ASC"]],
    }).catch(() => []);

    return res.json({ success: true, data: staff });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// POST /api/kasubag/tugas-mandiri
// Kasubag membuat tugas baru sekaligus menugaskan ke pelaksana — TANPA perlu perintah dari Sekretaris.
// Alur: draft → assigned (satu langkah atomik)
export async function createTugasMandiri(req, res) {
  const t = await sequelize.transaction();
  try {
    const actorId = req.user?.id;
    if (!actorId) {
      await t.rollback();
      return res.status(401).json({ success: false, error: "unauthenticated" });
    }

    const {
      title,
      description,
      output_diharapkan,
      assignee_user_id,
      due_date,
      tanggal_penugasan,
      waktu_penugasan,
      priority = "normal",
      sifat_perintah,
      referensi,
      catatan,
    } = req.body;

    if (!title || String(title).trim() === "") {
      await t.rollback();
      return res.status(400).json({ success: false, error: "Judul tugas wajib diisi" });
    }
    if (!assignee_user_id) {
      await t.rollback();
      return res.status(400).json({ success: false, error: "Pilih pelaksana terlebih dahulu" });
    }
    if (!due_date) {
      await t.rollback();
      return res.status(400).json({ success: false, error: "Deadline wajib diisi" });
    }

    // Validasi: pastikan assignee adalah bawahan Kasubag ini
    const hierRel = await UserHierarchy.findOne({
      where: { supervisor_id: actorId, user_id: Number(assignee_user_id) },
      transaction: t,
    });
    if (!hierRel) {
      await t.rollback();
      return res.status(403).json({
        success: false,
        error: "Pelaksana yang dipilih bukan bawahan langsung Anda dalam hierarki kepegawaian",
      });
    }

    const tglPenugasan =
      tanggal_penugasan && String(tanggal_penugasan).trim() !== ""
        ? String(tanggal_penugasan).trim()
        : new Date().toISOString().slice(0, 10);

    const actor = await User.findByPk(actorId, {
      attributes: ["unit_kerja", "nama_lengkap"],
      transaction: t,
    });

    // Buat referensi otomatis jika tidak ada
    const refCode =
      referensi && String(referensi).trim() !== ""
        ? String(referensi).trim()
        : `TGS/SEK/KSB/${tglPenugasan.replace(/-/g, "")}`;

    const metadata = {
      jenis_tugas: "mandiri",
      output_diharapkan: output_diharapkan || null,
      referensi: refCode,
      catatan_kasubag: catatan || null,
      sifat_perintah: sifat_perintah || null,
      waktu_penugasan: waktu_penugasan || new Date().toISOString(),
      surat_tugas_ke_pelaksana: {
        tanggal_penugasan: tglPenugasan,
        waktu_penugasan: waktu_penugasan || new Date().toISOString(),
        sifat_perintah: sifat_perintah || null,
        dicatat_pada: new Date().toISOString(),
        assigned_by_user_id: actorId,
        catatan_kasubag: catatan || null,
      },
    };

    // Step 1: Buat task dengan status draft
    const task = await Task.create(
      {
        title: String(title).trim(),
        description: description ? String(description).trim() : null,
        module: "kepegawaian_umum",
        source_unit: actor?.unit_kerja || "Sekretariat",
        priority,
        due_date: new Date(due_date),
        created_by: actorId,
        status: "draft",
        metadata,
      },
      { transaction: t },
    );

    await TaskLog.create(
      {
        task_id: task.id,
        actor_id: actorId,
        action: "CREATE_MANDIRI",
        data_new: { ...task.toJSON(), jenis: "tugas_mandiri_kasubag" },
      },
      { transaction: t },
    );

    // Step 2: Assign langsung ke pelaksana (draft → assigned)
    const assignee = await User.findByPk(Number(assignee_user_id), {
      attributes: ["id", "nama_lengkap", "role", "unit_kerja"],
      transaction: t,
    });
    if (!assignee) {
      await t.rollback();
      return res.status(404).json({ success: false, error: "Pelaksana tidak ditemukan" });
    }

    task.status = "assigned";
    task.metadata = {
      ...task.metadata,
      surat_tugas_ke_pelaksana: {
        ...task.metadata.surat_tugas_ke_pelaksana,
        assignee_nama: assignee.nama_lengkap,
        assignee_role: assignee.role,
      },
    };
    await task.save({ transaction: t });

    await TaskAssignment.create(
      {
        task_id: task.id,
        assignee_user_id: assignee.id,
        assignee_role: assignee.role,
        assigned_by: actorId,
        status: "assigned",
        note: catatan || null,
        due_date: new Date(due_date),
      },
      { transaction: t },
    );

    await TaskLog.create(
      {
        task_id: task.id,
        actor_id: actorId,
        action: "ASSIGN_MANDIRI",
        data_new: { to: assignee.id, nama: assignee.nama_lengkap, tgl: tglPenugasan },
      },
      { transaction: t },
    );

    // Kirim notifikasi ke pelaksana
    await Notification.create(
      {
        user_id: assignee.id,
        task_id: task.id,
        type: "task_assigned",
        message: `Tugas baru dari Kasubag: "${task.title}" — deadline ${due_date}`,
        is_read: false,
      },
      { transaction: t },
    ).catch(() => null);

    await t.commit();

    return res.status(201).json({
      success: true,
      message: `Tugas berhasil dibuat dan ditugaskan ke ${assignee.nama_lengkap}`,
      data: {
        task_id: task.id,
        title: task.title,
        status: task.status,
        assignee: { id: assignee.id, nama_lengkap: assignee.nama_lengkap },
        due_date,
        referensi: refCode,
      },
    });
  } catch (err) {
    await t.rollback();
    return res.status(500).json({ success: false, error: err.message });
  }
}
