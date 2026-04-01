import { Op } from "sequelize";
import TaskAssignment from "../../models/TaskAssignment.js";
import AsetBarang from "../../models/AsetBarang.js";
import PenerimaanBarang from "../../models/PenerimaanBarang.js";
import PemeliharaanAset from "../../models/PemeliharaanAset.js";
import LaporanKerusakanAset from "../../models/LaporanKerusakanAset.js";

export async function getSummary(req, res) {
  try {
    const userId = req.user?.id;
    const inboxCount = await TaskAssignment.count({
      where: { assignee_user_id: userId, status: { [Op.in]: ["assigned"] } },
    }).catch(() => 0);

    const penerimaanPending = await PenerimaanBarang.count({
      where: {
        status: { [Op.in]: ["menunggu_kedatangan", "barang_tiba", "menunggu_penerimaan", "pending"] },
      },
    }).catch(() => 0);

    const dikembalikanPpk = await PenerimaanBarang.count({
      where: { status: "dikembalikan_ppk" },
    }).catch(() => 0);

    const asetKritis = await AsetBarang.count({
      where: { kondisi: { [Op.in]: ["rusak_berat", "hilang"] } },
    }).catch(() => 0);

    const jadwal30hari = await PemeliharaanAset.count({
      where: {
        status: { [Op.in]: ["dijadwalkan", "dalam_proses"] },
        tanggal_jadwal: {
          [Op.between]: [
            new Date().toISOString().slice(0, 10),
            new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
          ],
        },
      },
    }).catch(() => 0);

    const kerusakanMasuk = await LaporanKerusakanAset.count({
      where: { status_tindak_lanjut: { [Op.in]: ["belum_ditindaklanjuti", "sedang_diperiksa"] } },
    }).catch(() => 0);

    return res.json({
      success: true,
      data: {
        inbox_sekretaris: inboxCount,
        penerimaan_pending: penerimaanPending,
        dikembalikan_ppk: dikembalikanPpk,
        aset_kritis: asetKritis,
        jadwal_pemeliharaan: jadwal30hari,
        kerusakan_masuk: kerusakanMasuk,
        sla_penerimaan: 90,
        kelengkapan_bmd_pct: 75,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil ringkasan dashboard Bendahara Barang",
      error: err.message,
    });
  }
}

