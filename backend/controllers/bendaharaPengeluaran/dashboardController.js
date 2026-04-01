import { Op } from "sequelize";
import TaskAssignment from "../../models/TaskAssignment.js";
import Spj from "../../models/Spj.js";
import UangPersediaan from "../../models/UangPersediaan.js";

function toNum(x) {
  const n = Number(String(x ?? 0).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export async function getSummary(req, res) {
  try {
    const userId = req.user?.id;
    const now = new Date();
    const tahun = now.getFullYear();

    const inboxCount = await TaskAssignment.count({
      where: { assignee_user_id: userId, status: { [Op.in]: ["assigned"] } },
    }).catch(() => 0);

    const spjMasuk = await Spj.count({
      where: { status: { [Op.in]: ["diajukan_ke_bendahara", "dikembalikan_bendahara"] } },
    }).catch(() => 0);

    const siapDibayar = await Spj.count({
      where: { status: "disetujui_sekretaris" },
    }).catch(() => 0);

    const dikembalikanPpk = await Spj.count({
      where: { status: "dikembalikan_ppk" },
    }).catch(() => 0);

    const upAwal = await UangPersediaan.sum("nominal_cair", {
      where: { tahun_anggaran: tahun, jenis: "up_awal", status: "cair" },
    }).catch(() => 0);

    const guCair = await UangPersediaan.sum("nominal_cair", {
      where: { tahun_anggaran: tahun, jenis: "gu", status: "cair" },
    }).catch(() => 0);

    const totalMasuk = toNum(upAwal) + toNum(guCair);

    const totalKeluar = await Spj.sum("nominal", {
      where: { status: "dibayarkan" },
    }).catch(() => 0);

    const saldoUp = Math.max(0, totalMasuk - toNum(totalKeluar));
    const saldoPct = totalMasuk > 0 ? Math.round((saldoUp / totalMasuk) * 100) : 0;

    return res.json({
      success: true,
      data: {
        inbox_sekretaris: inboxCount,
        spj_masuk: spjMasuk,
        siap_dibayar: siapDibayar,
        dikembalikan_ppk: dikembalikanPpk,
        saldo_up: saldoUp,
        saldo_up_total: totalMasuk,
        saldo_up_pct: saldoPct,
        sla_verif: 90,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil ringkasan dashboard Bendahara Pengeluaran",
      error: err.message,
    });
  }
}

