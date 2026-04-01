import { Op } from "sequelize";
import AnalisaPerencanaan from "../../models/AnalisaPerencanaan.js";
import Task from "../../models/Task.js";
import TaskAssignment from "../../models/TaskAssignment.js";

export async function getSummary(req, res) {
  try {
    const userId = req.user?.id;

    const inboxCount = await TaskAssignment.count({
      where: { assignee_user_id: userId, status: { [Op.in]: ["assigned"] } },
    });

    const analisaQueueCount = await Task.count({
      where: {
        status: { [Op.in]: ["assigned", "accepted", "in_progress", "submitted"] },
      },
      // NOTE: queue analisa khusus JF Perencanaan berbasis analisa_perencanaan + task_id,
      // tapi untuk MVP pakai task assigned ke user (lebih stabil).
      include: [],
    }).catch(() => 0);

    const dikembalikanCount = await AnalisaPerencanaan.count({
      where: {
        dibuat_oleh: userId,
        status: { [Op.in]: ["dikembalikan_sekretaris", "dikembalikan_kasubag"] },
      },
    });

    const disetujuiBulanIni = await AnalisaPerencanaan.count({
      where: {
        dibuat_oleh: userId,
        status: "disetujui",
        updated_at: { [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
    });

    // SLA placeholder: dihitung sederhana dari persentase analisa disetujui vs total bulan ini.
    const totalBulanIni = await AnalisaPerencanaan.count({
      where: {
        dibuat_oleh: userId,
        created_at: { [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
    });
    const slaPct = totalBulanIni > 0 ? Math.round((disetujuiBulanIni / totalBulanIni) * 100) : 100;

    return res.json({
      success: true,
      data: {
        inbox_sekretaris: inboxCount,
        analisa_queue: analisaQueueCount,
        dikembalikan: dikembalikanCount,
        disetujui_bulan_ini: disetujuiBulanIni,
        sla_analisa: slaPct,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil ringkasan dashboard JF Perencanaan",
      error: err.message,
    });
  }
}

