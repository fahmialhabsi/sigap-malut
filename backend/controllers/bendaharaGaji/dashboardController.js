import { Op } from "sequelize";
import TaskAssignment from "../../models/TaskAssignment.js";
import DaftarGaji from "../../models/DaftarGaji.js";

export async function getSummary(req, res) {
  try {
    const userId = req.user?.id;
    const now = new Date();
    const bulan = now.getMonth() + 1;
    const tahun = now.getFullYear();

    const inboxCount = await TaskAssignment.count({
      where: { assignee_user_id: userId, status: { [Op.in]: ["assigned"] } },
    }).catch(() => 0);

    const bulanIni = await DaftarGaji.findOne({
      where: { periode_bulan: bulan, periode_tahun: tahun, dibuat_oleh: userId },
      order: [["updated_at", "DESC"]],
    }).catch(() => null);

    const dikembalikan = await DaftarGaji.count({
      where: { dibuat_oleh: userId, status: { [Op.in]: ["dikembalikan_jf_keuangan", "dikembalikan_kasubag", "dikembalikan_sekretaris"] } },
    }).catch(() => 0);

    const perubahanPending = 0; // MVP: akan diisi dari log sinkronisasi kepegawaian di iterasi berikut

    const tahap = bulanIni?.status || "belum_ada";

    return res.json({
      success: true,
      data: {
        inbox_sekretaris: inboxCount,
        status_daftar_gaji: tahap,
        perubahan_kepeg_pending: perubahanPending,
        dikembalikan: dikembalikan,
        anomali: 0,
        sla_proses: 90,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil ringkasan dashboard Bendahara Gaji",
      error: err.message,
    });
  }
}

