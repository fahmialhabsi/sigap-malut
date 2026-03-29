// backend/controllers/sekretaris/kpiBypassController.js
// Monitor 50 KPI sistem + Bypass Alert Center untuk Sekretaris

import { Op, QueryTypes } from "sequelize";
import sequelize from "../../config/database.js";
import BypassDetection from "../../models/bypassDetection.js";
import Notification from "../../models/Notification.js";

const safe = (v, fb = 0) => (v == null || Number.isNaN(Number(v)) ? fb : Number(v));

// 50 KPI definisi — dibagi 6 kategori
const KPI_DEFINITIONS = [
  // Operasional (10)
  { id: "K01", kategori: "operasional", label: "Persentase Surat Terdisposisi Tepat Waktu", satuan: "%", target: 95, query: null },
  { id: "K02", kategori: "operasional", label: "Rata-rata Waktu Disposisi Surat (Jam)", satuan: "jam", target: 24, arah: "min", query: null },
  { id: "K03", kategori: "operasional", label: "Persentase Dokumen Terarsip Digital", satuan: "%", target: 100, query: null },
  { id: "K04", kategori: "operasional", label: "Jumlah Perintah Selesai Tepat Waktu (%)", satuan: "%", target: 90, query: null },
  { id: "K05", kategori: "operasional", label: "Rata-rata Waktu Respon Pengaduan (Hari)", satuan: "hari", target: 3, arah: "min", query: null },
  { id: "K06", kategori: "operasional", label: "Persentase Rapat Terlaksana Sesuai Jadwal", satuan: "%", target: 95, query: null },
  { id: "K07", kategori: "operasional", label: "Persentase Laporan Bidang Tepat Waktu", satuan: "%", target: 100, query: null },
  { id: "K08", kategori: "operasional", label: "Jumlah Bypass Terdeteksi Bulan Ini", satuan: "kasus", target: 0, arah: "min", query: "bypass" },
  { id: "K09", kategori: "operasional", label: "Persentase Approval Queue Diselesaikan < 2 Hari", satuan: "%", target: 85, query: null },
  { id: "K10", kategori: "operasional", label: "Persentase Tugas Bawahan On-Time", satuan: "%", target: 90, query: null },
  // Akuntabilitas (8)
  { id: "K11", kategori: "akuntabilitas", label: "Jumlah Temuan BPK/Inspektorat Aktif", satuan: "temuan", target: 0, arah: "min", query: null },
  { id: "K12", kategori: "akuntabilitas", label: "Persentase Tindak Lanjut Temuan Selesai", satuan: "%", target: 100, query: null },
  { id: "K13", kategori: "akuntabilitas", label: "Persentase SPJ Terlambat", satuan: "%", target: 0, arah: "min", query: null },
  { id: "K14", kategori: "akuntabilitas", label: "Nilai SAKIP (Poin)", satuan: "poin", target: 70, query: null },
  { id: "K15", kategori: "akuntabilitas", label: "Persentase Realisasi RKPD", satuan: "%", target: 95, query: null },
  { id: "K16", kategori: "akuntabilitas", label: "Laporan Keuangan Tepat Waktu (%)", satuan: "%", target: 100, query: null },
  { id: "K17", kategori: "akuntabilitas", label: "Ketersediaan Dokumen Perencanaan (RPJMD/Renja)", satuan: "%", target: 100, query: null },
  { id: "K18", kategori: "akuntabilitas", label: "Persentase SLA Layanan Terpenuhi", satuan: "%", target: 90, query: null },
  // Kepegawaian (10)
  { id: "K19", kategori: "kepegawaian", label: "Persentase KGB Diproses Tepat Waktu", satuan: "%", target: 100, query: null },
  { id: "K20", kategori: "kepegawaian", label: "Jumlah KGB Jatuh Tempo < 30 Hari", satuan: "orang", target: 0, arah: "min", query: "kgb" },
  { id: "K21", kategori: "kepegawaian", label: "Persentase SKP Selesai Tepat Waktu", satuan: "%", target: 100, query: null },
  { id: "K22", kategori: "kepegawaian", label: "Tingkat Kehadiran Pegawai (%)", satuan: "%", target: 95, query: null },
  { id: "K23", kategori: "kepegawaian", label: "Jumlah Pegawai Aktif", satuan: "orang", target: null, query: null },
  { id: "K24", kategori: "kepegawaian", label: "Persentase Usulan Kenaikan Pangkat Tepat Waktu", satuan: "%", target: 100, query: null },
  { id: "K25", kategori: "kepegawaian", label: "Jumlah Pelatihan Diikuti Pegawai (Kumulatif)", satuan: "kali", target: null, query: null },
  { id: "K26", kategori: "kepegawaian", label: "Persentase Dokumen Kepegawaian Lengkap", satuan: "%", target: 95, query: null },
  { id: "K27", kategori: "kepegawaian", label: "Jam Pelatihan Per Pegawai Per Tahun", satuan: "jam", target: 20, query: null },
  { id: "K28", kategori: "kepegawaian", label: "Indeks Kepuasan Pegawai", satuan: "skor", target: 75, query: null },
  // Keuangan (12)
  { id: "K29", kategori: "keuangan", label: "Persentase Penyerapan DPA", satuan: "%", target: 95, query: "anggaran" },
  { id: "K30", kategori: "keuangan", label: "Persentase SPJ Diverifikasi Tepat Waktu", satuan: "%", target: 100, query: null },
  { id: "K31", kategori: "keuangan", label: "Jumlah SPP/SPM Pending > 5 Hari", satuan: "dokumen", target: 0, arah: "min", query: null },
  { id: "K32", kategori: "keuangan", label: "Realisasi GU/TUP (Pengembalian Tepat Waktu %)", satuan: "%", target: 100, query: null },
  { id: "K33", kategori: "keuangan", label: "Persentase Laporan Keuangan Triwulan On-Time", satuan: "%", target: 100, query: null },
  { id: "K34", kategori: "keuangan", label: "Jumlah Temuan Kas yang Belum Diselesaikan", satuan: "item", target: 0, arah: "min", query: null },
  { id: "K35", kategori: "keuangan", label: "Selisih Stock Opname Aset (Nilai)", satuan: "Rp", target: 0, arah: "min", query: null },
  { id: "K36", kategori: "keuangan", label: "Persentase Kontrak Pengadaan Sesuai RUP", satuan: "%", target: 100, query: null },
  { id: "K37", kategori: "keuangan", label: "Nilai Aset Tidak Teridentifikasi", satuan: "item", target: 0, arah: "min", query: null },
  { id: "K38", kategori: "keuangan", label: "Persentase Rekonsiliasi Keuangan Selesai", satuan: "%", target: 100, query: null },
  { id: "K39", kategori: "keuangan", label: "Persentase BMD Terkuasai/Termonitor", satuan: "%", target: 95, query: null },
  { id: "K40", kategori: "keuangan", label: "Realisasi Belanja Modal (%)", satuan: "%", target: 90, query: null },
  // Aset (5)
  { id: "K41", kategori: "aset", label: "Persentase Aset Terdaftar di SIMDA", satuan: "%", target: 100, query: null },
  { id: "K42", kategori: "aset", label: "Jumlah Aset Kondisi Rusak Berat", satuan: "unit", target: 0, arah: "min", query: null },
  { id: "K43", kategori: "aset", label: "Persentase Kendaraan Dinas Terpelihara", satuan: "%", target: 100, query: null },
  { id: "K44", kategori: "aset", label: "Persentase Gedung/Fasilitas Kondisi Baik", satuan: "%", target: 95, query: null },
  { id: "K45", kategori: "aset", label: "Pembaruan Data Inventaris (Bulanan %)", satuan: "%", target: 100, query: null },
  // Dampak Strategis (5)
  { id: "K46", kategori: "strategis", label: "Data SPPG Terinput dari Kab/Kota (%)", satuan: "%", target: 100, query: "sppg" },
  { id: "K47", kategori: "strategis", label: "Ketersediaan Bahan untuk Rapat TPID (%)", satuan: "%", target: 100, query: null },
  { id: "K48", kategori: "strategis", label: "Laporan Konsolidasi ke Kepala Dinas Tepat Waktu", satuan: "%", target: 100, query: null },
  { id: "K49", kategori: "strategis", label: "Indeks Koordinasi Lintas Bidang", satuan: "skor", target: 80, query: null },
  { id: "K50", kategori: "strategis", label: "Persentase Indikator SPM Pangan Tercapai", satuan: "%", target: 80, query: null },
];

async function queryKpiValue(kpi) {
  try {
    if (!kpi.query) return { nilai: null, status: "no_data" };

    if (kpi.query === "bypass") {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const count = await BypassDetection.count({
        where: { detected_at: { [Op.gte]: firstDay } },
      }).catch(() => 0);
      return { nilai: count, status: count <= kpi.target ? "on_target" : "below_target" };
    }

    if (kpi.query === "kgb") {
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
      const count = await sequelize.query(
        `SELECT COUNT(*) as cnt FROM "SEK-KBJ" WHERE tanggal_kgb <= :cutoff AND status IN ('draft','diajukan') AND deleted_at IS NULL`,
        { type: QueryTypes.SELECT, replacements: { cutoff: thirtyDaysLater } }
      ).then((r) => safe(r[0]?.cnt)).catch(() => 0);
      return { nilai: count, status: count === 0 ? "on_target" : count <= 5 ? "warning" : "below_target" };
    }

    if (kpi.query === "anggaran") {
      const row = await sequelize.query(
        `SELECT SUM(total_anggaran) as total, SUM(total_realisasi) as realisasi FROM "SEK-KEU" WHERE deleted_at IS NULL`,
        { type: QueryTypes.SELECT }
      ).then((r) => r[0]).catch(() => null);
      if (!row?.total) return { nilai: null, status: "no_data" };
      const pct = Math.round((safe(row.realisasi) / safe(row.total)) * 100);
      return { nilai: pct, status: pct >= kpi.target ? "on_target" : pct >= kpi.target - 10 ? "warning" : "below_target" };
    }

    if (kpi.query === "sppg") {
      // Placeholder: hitung dari data yang tersedia
      return { nilai: null, status: "no_data" };
    }

    return { nilai: null, status: "no_data" };
  } catch {
    return { nilai: null, status: "no_data" };
  }
}

function getKpiStatus(nilai, target, arah = "max") {
  if (nilai === null || target === null) return "no_data";
  if (arah === "min") {
    if (nilai <= target) return "on_target";
    if (nilai <= target * 1.5) return "warning";
    return "below_target";
  }
  if (nilai >= target) return "on_target";
  if (nilai >= target * 0.85) return "warning";
  return "below_target";
}

// GET /api/sekretaris/kpi/semua
export const getSemuaKpi = async (req, res) => {
  try {
    const { kategori } = req.query;
    let kpiList = kategori ? KPI_DEFINITIONS.filter((k) => k.kategori === kategori) : KPI_DEFINITIONS;

    const enriched = await Promise.all(
      kpiList.map(async (kpi) => {
        const { nilai, status: qStatus } = await queryKpiValue(kpi);
        const status = nilai !== null ? getKpiStatus(nilai, kpi.target, kpi.arah) : qStatus;
        return { ...kpi, nilai, status, query: undefined };
      })
    );

    const summary = {
      total: enriched.length,
      on_target: enriched.filter((k) => k.status === "on_target").length,
      warning: enriched.filter((k) => k.status === "warning").length,
      below_target: enriched.filter((k) => k.status === "below_target").length,
      no_data: enriched.filter((k) => k.status === "no_data").length,
    };

    res.json({ success: true, data: enriched, summary });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/sekretaris/kpi/alert
export const getKpiAlert = async (req, res) => {
  try {
    const enriched = await Promise.all(
      KPI_DEFINITIONS.map(async (kpi) => {
        const { nilai, status: qStatus } = await queryKpiValue(kpi);
        const status = nilai !== null ? getKpiStatus(nilai, kpi.target, kpi.arah) : qStatus;
        return { ...kpi, nilai, status, query: undefined };
      })
    );

    const alerts = enriched.filter((k) => ["below_target", "warning"].includes(k.status));
    res.json({ success: true, data: alerts, total: alerts.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/sekretaris/bypass/list
export const getBypassList = async (req, res) => {
  try {
    const list = await BypassDetection.findAll({
      order: [["detected_at", "DESC"]],
      limit: 50,
      raw: true,
    }).catch(() => []);

    // Hitung statistik bulan ini vs bulan lalu
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [bulanIni, bulanLalu] = await Promise.all([
      BypassDetection.count({ where: { detected_at: { [Op.gte]: firstDayThisMonth } } }).catch(() => 0),
      BypassDetection.count({
        where: { detected_at: { [Op.gte]: firstDayLastMonth, [Op.lt]: firstDayThisMonth } },
      }).catch(() => 0),
    ]);

    res.json({
      success: true,
      data: list,
      stats: { bulan_ini: bulanIni, bulan_lalu: bulanLalu, tren: bulanIni - bulanLalu },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/sekretaris/bypass/:id/teguran
export const kirimTeguran = async (req, res) => {
  const { catatan } = req.body || {};
  try {
    const bypass = await BypassDetection.findByPk(req.params.id);
    if (!bypass) return res.status(404).json({ success: false, message: "Data bypass tidak ditemukan." });

    // Buat notifikasi teguran
    const targetUserId = bypass.user_id || bypass.actor_id || null;
    if (targetUserId) {
      await Notification.create({
        target_user_id: targetUserId,
        message: `Teguran: ${catatan || "Anda terdeteksi melakukan bypass alur koordinasi yang baku."}`,
        channel: "in_app",
      }).catch(() => {});
    }

    // Tandai bypass sudah ditindaklanjuti (soft delete agar tidak muncul lagi di alert aktif)
    await bypass.destroy().catch(() => {});

    res.json({ success: true, message: "Teguran digital berhasil dikirim." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
