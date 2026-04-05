import { Op } from "sequelize";
import Task from "../../models/Task.js";
import TaskAssignment from "../../models/TaskAssignment.js";

async function loadMyAssignments(userId, statuses, limit) {
  const assignments = await TaskAssignment.findAll({
    where: {
      assignee_user_id: userId,
      status: { [Op.in]: statuses },
    },
    order: [["assigned_at", "DESC"]],
    limit,
  });
  const taskIds = assignments.map((a) => a.task_id).filter(Boolean);
  const tasks = taskIds.length
    ? await Task.findAll({ where: { id: { [Op.in]: taskIds } }, order: [["updated_at", "DESC"]] })
    : [];
  const byId = new Map(tasks.map((t) => [t.id, t]));
  return assignments
    .map((a) => {
      const t = byId.get(a.task_id);
      if (!t) return null;
      return {
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        due_date: t.due_date,
        module: t.module,
        source_unit: t.source_unit,
        assigned_at: a.assigned_at,
        assignment_status: a.status,
        returned_at: t.returned_at,
        catatan_verifikasi: t.catatan_verifikasi,
        revisi_ke: t.revisi_ke,
      };
    })
    .filter(Boolean);
}

export async function listTugasSaya(req, res) {
  try {
    const userId = req.user?.id;
    const limit = Math.min(parseInt(req.query.limit || "30", 10), 100);
    const status = String(req.query.status || "aktif").toLowerCase(); // aktif|selesai|semua|dikembalikan

    if (status === "dikembalikan") {
      // Semua assignment aktif — lalu filter task yang di-return
      const rows = await loadMyAssignments(
        userId,
        ["assigned", "accepted", "in_progress"],
        limit,
      );
      const returned = rows.filter(
        (t) =>
          t.status === "returned_to_pelaksana" || t.status === "rejected",
      );
      return res.json({ success: true, data: returned, total: returned.length });
    }

    if (status === "selesai") {
      const rows = await loadMyAssignments(userId, ["accepted"], limit); // assignment accepted may still be running; but tasks may be closed
      const done = rows.filter((t) => ["verified", "closed"].includes(t.status));
      return res.json({ success: true, data: done, total: done.length });
    }

    if (status === "semua") {
      const rows = await loadMyAssignments(userId, ["assigned", "accepted", "in_progress"], limit);
      return res.json({ success: true, data: rows, total: rows.length });
    }

    const rows = await loadMyAssignments(userId, ["assigned", "accepted", "in_progress"], limit);
    const aktif = rows.filter((t) => !["verified", "closed"].includes(t.status));
    return res.json({ success: true, data: aktif, total: aktif.length });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal mengambil tugas saya", error: err.message });
  }
}

export async function terimaTugas(req, res) {
  try {
    const userId = req.user?.id;
    const taskId = parseInt(req.params.id, 10);
    const a = await TaskAssignment.findOne({ where: { task_id: taskId, assignee_user_id: userId } });
    if (!a) return res.status(404).json({ success: false, message: "Assignment tidak ditemukan" });
    a.status = "accepted";
    await a.save();

    const t = await Task.findByPk(taskId);
    if (t && t.status === "assigned") {
      t.status = "accepted";
      await t.save();
    }
    return res.json({ success: true, message: "Tugas diterima" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal menerima tugas", error: err.message });
  }
}

export async function mulaiTugas(req, res) {
  try {
    const userId = req.user?.id;
    const taskId = parseInt(req.params.id, 10);
    const a = await TaskAssignment.findOne({ where: { task_id: taskId, assignee_user_id: userId } });
    if (!a) return res.status(404).json({ success: false, message: "Assignment tidak ditemukan" });

    const t = await Task.findByPk(taskId);
    if (!t) return res.status(404).json({ success: false, message: "Task tidak ditemukan" });
    // returned_to_pelaksana diizinkan agar pelaksana dapat melanjutkan pekerjaan
    // setelah membaca catatan perbaikan dari Kasubag/JF.
    if (!["accepted", "assigned", "returned_to_pelaksana"].includes(t.status)) {
      return res.status(400).json({ success: false, message: "Task tidak bisa dimulai pada status ini" });
    }
    t.status = "in_progress";
    await t.save();
    return res.json({ success: true, message: "Tugas dimulai" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal mulai tugas", error: err.message });
  }
}

export async function submitHasil(req, res) {
  try {
    const userId = req.user?.id;
    const taskId = parseInt(req.params.id, 10);
    const { output_ringkas, output_url } = req.body || {};

    // ── Validation (canonical: sama dengan POST /api/tasks/:id/submit) ─────────
    const ringkas = String(output_ringkas || "").trim();
    if (ringkas.length < 50) {
      return res.status(400).json({
        success: false,
        code: "OUTPUT_TOO_SHORT",
        message: "Ringkasan hasil wajib diisi minimal 50 karakter sebelum dikirim ke atasan.",
      });
    }

    const a = await TaskAssignment.findOne({ where: { task_id: taskId, assignee_user_id: userId } });
    if (!a) return res.status(404).json({ success: false, message: "Assignment tidak ditemukan" });

    const t = await Task.findByPk(taskId);
    if (!t) return res.status(404).json({ success: false, message: "Task tidak ditemukan" });

    // ── Status check: hanya in_progress atau returned_to_pelaksana ───────────
    const VALID_FROM = ["in_progress", "returned_to_pelaksana"];
    if (!VALID_FROM.includes(t.status)) {
      return res.status(400).json({
        success: false,
        message: `Task tidak dapat disubmit dari status '${t.status}'. Pastikan tugas sedang berjalan atau dikembalikan untuk revisi.`,
      });
    }

    // ── URL wajib untuk tugas kepegawaian / ASN ──────────────────────────────
    const modul = String(t.module || t.modul_id || "").toLowerCase();
    const isAsnTask = ["kepegawaian", "asn", "kgb", "absensi"].some((k) => modul.includes(k));
    if (isAsnTask && !String(output_url || "").trim()) {
      return res.status(400).json({
        success: false,
        code: "OUTPUT_URL_REQUIRED",
        message: "Tugas kepegawaian/ASN wajib menyertakan tautan dokumen pendukung (output_url).",
      });
    }

    t.status = "submitted";
    t.metadata = {
      ...(t.metadata || {}),
      pelaksana_submit: {
        output_ringkas: ringkas,
        output_url: String(output_url || "").trim() || null,
        submitted_at: new Date().toISOString(),
        submitted_by: userId,
      },
    };
    await t.save();
    return res.json({ success: true, message: "Hasil tugas dikirim ke Kasubag", data: { id: t.id, status: t.status } });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal submit hasil", error: err.message });
  }
}

