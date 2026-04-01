import { Op } from "sequelize";
import Task from "../../models/Task.js";
import TaskAssignment from "../../models/TaskAssignment.js";

function ensureAssoc() {
  if (!Task.associations?.assignments) {
    Task.hasMany(TaskAssignment, { foreignKey: "task_id", as: "assignments" });
  }
}

const BAWAHAN = [
  { key: "sekretaris", label: "Sekretaris" },
  { key: "kepala_bidang_ketersediaan", label: "Kabid Ketersediaan" },
  { key: "kepala_bidang_distribusi", label: "Kabid Distribusi" },
  { key: "kepala_bidang_konsumsi", label: "Kabid Konsumsi" },
  { key: "kepala_uptd", label: "Kepala UPTD" },
];

function scoreFromCounts({ total, selesai, terlambat }) {
  if (!total) return 0;
  const completion = selesai / total;
  const late = terlambat / total;
  const s = Math.round((completion * 100) - late * 40);
  return Math.max(0, Math.min(100, s));
}

export async function getKinerjaBawahan(req, res) {
  try {
    ensureAssoc();
    const kadinId = req.user?.id;

    const tasks = await Task.findAll({
      where: { created_by: kadinId },
      include: [{ model: TaskAssignment, as: "assignments", required: true }],
      order: [["created_at", "DESC"]],
      limit: 500,
    });

    const byRole = new Map(BAWAHAN.map((b) => [b.key, { ...b, total: 0, selesai: 0, terlambat: 0, aktif: 0 }]));

    for (const t of tasks) {
      const ass = t.assignments || [];
      for (const a of ass) {
        const r = String(a.assignee_role || "").toLowerCase();
        if (!byRole.has(r)) continue;
        const bucket = byRole.get(r);
        bucket.total += 1;

        const isDone = ["closed", "verified"].includes(String(t.status));
        const isActive = ["assigned", "accepted", "in_progress", "submitted", "review_kabid", "forwarded_to_kadin"].includes(
          String(t.status),
        );
        if (isDone) bucket.selesai += 1;
        if (isActive) bucket.aktif += 1;

        // terlambat sederhana: due_date terlewati & belum selesai
        if (!isDone && t.due_date && new Date(t.due_date).getTime() < Date.now()) {
          bucket.terlambat += 1;
        }
      }
    }

    const data = Array.from(byRole.values()).map((b) => ({
      ...b,
      skor: scoreFromCounts(b),
      kategori:
        b.total === 0
          ? "—"
          : scoreFromCounts(b) >= 85
            ? "sangat_baik"
            : scoreFromCounts(b) >= 70
              ? "baik"
              : scoreFromCounts(b) >= 55
                ? "cukup"
                : scoreFromCounts(b) >= 40
                  ? "kurang"
                  : "sangat_kurang",
    }));

    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal hitung kinerja bawahan", error: err.message });
  }
}

