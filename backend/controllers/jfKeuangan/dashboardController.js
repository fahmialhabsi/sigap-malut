import { Op } from "sequelize";
import TaskAssignment from "../../models/TaskAssignment.js";
import Spj from "../../models/Spj.js";

export async function getSummary(req, res) {
  try {
    const userId = req.user?.id;

    const inboxCount = await TaskAssignment.count({
      where: { assignee_user_id: userId, status: { [Op.in]: ["assigned"] } },
    }).catch(() => 0);

    const ppkQueue = await Spj.count({
      where: { status: { [Op.in]: ["diajukan_ke_ppk", "dikembalikan_ppk"] } },
    }).catch(() => 0);

    const dikembalikan = await Spj.count({
      where: { status: { [Op.in]: ["dikembalikan_ppk"] } },
    }).catch(() => 0);

    // MVP realisasi: placeholder berbasis jumlah SPJ disetujui sekretaris
    const approvedCount = await Spj.count({
      where: { status: "disetujui_sekretaris" },
    }).catch(() => 0);
    const totalCount = await Spj.count().catch(() => 0);
    const realisasiPct = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;

    const temuanSpj = await Spj.count({
      where: { status: { [Op.in]: ["dikembalikan_ppk", "ditolak_ppk"] } },
    }).catch(() => 0);

    const slaVerif = 90; // placeholder untuk MVP

    return res.json({
      success: true,
      data: {
        inbox_sekretaris: inboxCount,
        ppk_queue: ppkQueue,
        dikembalikan,
        realisasi_pct: realisasiPct,
        temuan_spj: temuanSpj,
        sla_verif: slaVerif,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil ringkasan dashboard JF Keuangan/PPK",
      error: err.message,
    });
  }
}

