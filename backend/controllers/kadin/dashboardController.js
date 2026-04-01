import { Op } from "sequelize";
import Task from "../../models/Task.js";
import TaskAssignment from "../../models/TaskAssignment.js";
import { InstruksiGubernur, PengajuanKeKepalaDinas } from "../../models/index.js";

function ensureAssoc() {
  if (!Task.associations?.assignments) {
    Task.hasMany(TaskAssignment, { foreignKey: "task_id", as: "assignments" });
  }
}

export async function getSummary(req, res) {
  try {
    ensureAssoc();
    const kadinId = req.user?.id;

    const [inboxGub, perintahAktif, approvalQueue] = await Promise.all([
      InstruksiGubernur.count({
        where: { assigned_to: kadinId, status: { [Op.in]: ["diterbitkan"] } },
      }),
      Task.count({
        where: { created_by: kadinId, status: { [Op.notIn]: ["closed", "rejected"] } },
      }),
      PengajuanKeKepalaDinas.count({
        where: {
          divalidasi_sekretaris: true,
          status: { [Op.in]: ["diteruskan_ke_kadin", "dalam_review_kadin"] },
        },
      }),
    ]);

    return res.json({
      success: true,
      data: {
        inbox_gubernur: inboxGub,
        perintah_aktif: perintahAktif,
        approval_queue: approvalQueue,
        sla_persen: 90, // MVP placeholder
        alert_kritis: 0, // MVP placeholder
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal ambil summary Kadis", error: err.message });
  }
}

