import { Op } from "sequelize";
import Task from "../../models/Task.js";
import TaskAssignment from "../../models/TaskAssignment.js";
import KgbTracking from "../../models/KgbTracking.js";

// GET /api/kasubag/dashboard/summary
export async function getKasubagDashboardSummary(req, res) {
  try {
    const actorId = req.user?.id;
    if (!actorId) return res.status(401).json({ success: false, error: "unauthenticated" });

    const assignedTaskIds = await TaskAssignment.findAll({
      where: { assignee_user_id: actorId },
      attributes: ["task_id"],
      limit: 2000,
    })
      .then((rows) => rows.map((r) => r.task_id))
      .catch(() => []);

    const inboxSekretaris = await Task.count({
      where: {
        id: assignedTaskIds.length ? { [Op.in]: assignedTaskIds } : -1,
        status: "assigned",
      },
    }).catch(() => 0);

    const verifikasiQueue = await Task.count({
      where: {
        id: assignedTaskIds.length ? { [Op.in]: assignedTaskIds } : -1,
        status: "submitted",
      },
    }).catch(() => 0);

    const kgbAlert = await KgbTracking.count({
      where: {
        tanggal_kgb_berikutnya: { [Op.lte]: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
      },
    }).catch(() => 0);

    // Placeholder SLA & score (akan dihitung lebih lengkap setelah panel tim + absensi aktif)
    return res.json({
      success: true,
      data: {
        inbox_sekretaris: inboxSekretaris,
        verifikasi_queue: verifikasiQueue,
        kgb_alert_30hari: kgbAlert,
        sla_tim_pct: null,
        skor_kinerja_pelaksana_avg: null,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

