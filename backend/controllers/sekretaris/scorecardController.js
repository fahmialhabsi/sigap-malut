// backend/controllers/sekretaris/scorecardController.js
// Scorecard kinerja & SKP penilaian oleh Sekretaris terhadap bawahan

import { Op } from "sequelize";
import SkpPenilaianSekretaris from "../../models/SkpPenilaianSekretaris.js";
import Perintah from "../../models/Perintah.js";
import ApprovalSekretariat from "../../models/ApprovalSekretariat.js";
import User from "../../models/User.js";

const safe = (v, fb = 0) => (v == null || Number.isNaN(Number(v)) ? fb : Number(v));

const BAWAHAN_ROLES_MAP = [
  { role: "kasubag_umum_kepegawaian", label: "Kasubag Umum & Kepegawaian", jabatan: "kasubag_umum_kepeg", icon: "👥" },
  { role: "fungsional_perencana", label: "JF Perencanaan", jabatan: "jf_perencanaan", icon: "📊" },
  { role: "fungsional_analis_keuangan", label: "JF Keuangan / PPK", jabatan: "jf_keuangan", icon: "💰" },
  { role: "bendahara_pengeluaran", label: "Bendahara Pengeluaran", jabatan: "bendahara_pengeluaran", icon: "🏦" },
  { role: "bendahara_gaji", label: "Bendahara Gaji", jabatan: "bendahara_gaji", icon: "💵" },
  { role: "bendahara_barang", label: "Bendahara Barang", jabatan: "bendahara_barang", icon: "📦" },
  { role: "pelaksana", label: "Pelaksana Sekretariat", jabatan: "pelaksana_sekretariat", icon: "📋" },
];

// GET /api/sekretaris/kinerja/bawahan
export const getScorecardBawahan = async (req, res) => {
  try {
    const now = new Date();
    const bulan = now.getMonth() + 1;
    const tahun = now.getFullYear();
    const sekretarisId = req.user?.id;

    const scorecard = [];

    for (const b of BAWAHAN_ROLES_MAP) {
      // Hitung kinerja dari data perintah
      const [total, selesai, terlambat, approvalSelesai, approvalRevisi] = await Promise.all([
        Perintah.count({ where: { dari_role: "sekretaris", ke_role: b.role } }).catch(() => 0),
        Perintah.count({ where: { dari_role: "sekretaris", ke_role: b.role, status: "selesai" } }).catch(() => 0),
        Perintah.count({
          where: {
            dari_role: "sekretaris", ke_role: b.role,
            status: { [Op.notIn]: ["selesai", "ditolak"] },
            deadline: { [Op.lt]: now },
          },
        }).catch(() => 0),
        // Dokumen disetujui tanpa revisi (revisi_ke=0, disetujui)
        ApprovalSekretariat.count({
          where: {
            asal_unit: b.jabatan.replace("kasubag_umum_kepeg", "kasubag_umum_kepeg")
              .replace("jf_keuangan", "jf_keuangan").replace("jf_perencanaan", "jf_perencanaan"),
            status: "disetujui",
            revisi_ke: 0,
            deleted_at: null,
          },
        }).catch(() => 0),
        ApprovalSekretariat.count({
          where: {
            asal_unit: b.jabatan,
            status: { [Op.in]: ["dikembalikan_sekretaris", "ditolak"] },
            deleted_at: null,
          },
        }).catch(() => 0),
      ]);

      const execution_rate = total > 0 ? Math.round(((selesai - terlambat) / total) * 100) : null;
      const doc_quality = (approvalSelesai + approvalRevisi) > 0
        ? Math.round((approvalSelesai / (approvalSelesai + approvalRevisi)) * 100) : null;

      // Ambil SKP terakhir bulan ini jika ada
      const skp = sekretarisId
        ? await SkpPenilaianSekretaris.findOne({
            where: {
              penilai_id: sekretarisId,
              jabatan_dinilai: b.jabatan,
              periode_bulan: bulan,
              periode_tahun: tahun,
            },
            raw: true,
          }).catch(() => null)
        : null;

      scorecard.push({
        ...b,
        tugas_total: total,
        tugas_selesai: selesai,
        tugas_terlambat: terlambat,
        execution_rate,
        doc_quality_rate: doc_quality,
        skp_bulan_ini: skp,
        skor_total: skp?.skor_total ?? null,
        kategori: skp?.kategori ?? null,
      });
    }

    res.json({ success: true, data: scorecard });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/sekretaris/kinerja/bawahan/:userId
export const getScorecardDetail = async (req, res) => {
  try {
    const { userId } = req.params;
    const sekretarisId = req.user?.id;

    const user = await User.findByPk(userId, { attributes: ["id", "name", "username"], raw: true }).catch(() => null);
    if (!user) return res.status(404).json({ success: false, message: "User tidak ditemukan." });

    // Riwayat SKP 6 bulan terakhir
    const now = new Date();
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const riwayatSkp = await SkpPenilaianSekretaris.findAll({
      where: {
        penilai_id: sekretarisId,
        yang_dinilai_id: userId,
      },
      order: [["periode_tahun", "DESC"], ["periode_bulan", "DESC"]],
      limit: 12,
      raw: true,
    }).catch(() => []);

    res.json({ success: true, data: { user, riwayat_skp: riwayatSkp } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/sekretaris/skp/:userId
export const isiSkp = async (req, res) => {
  const { userId } = req.params;
  const sekretarisId = req.user?.id;
  const {
    periode_bulan, periode_tahun, jabatan_dinilai,
    skor_skp, skor_perilaku, skor_output, skor_disiplin,
    catatan_kualitatif, skor_eksekusi_tugas, skor_kualitas_dokumen,
    skor_kepatuhan_alur, skor_ketepatan_laporan,
  } = req.body || {};

  if (!periode_bulan || !periode_tahun || !jabatan_dinilai) {
    return res.status(400).json({ success: false, message: "periode_bulan, periode_tahun, jabatan_dinilai wajib diisi." });
  }

  // Hitung skor total (rata-rata semua skor yang diisi)
  const skors = [skor_skp, skor_perilaku, skor_output, skor_disiplin,
    skor_eksekusi_tugas, skor_kualitas_dokumen, skor_kepatuhan_alur, skor_ketepatan_laporan]
    .map(Number).filter((v) => !isNaN(v) && v > 0);
  const skor_total = skors.length > 0 ? (skors.reduce((a, b) => a + b, 0) / skors.length).toFixed(2) : null;

  // Tentukan kategori
  let kategori = null;
  if (skor_total !== null) {
    const s = Number(skor_total);
    if (s >= 90) kategori = "sangat_baik";
    else if (s >= 76) kategori = "baik";
    else if (s >= 61) kategori = "cukup";
    else if (s >= 51) kategori = "kurang";
    else kategori = "sangat_kurang";
  }

  try {
    const [record, created] = await SkpPenilaianSekretaris.upsert({
      penilai_id: sekretarisId,
      yang_dinilai_id: userId,
      periode_bulan,
      periode_tahun,
      jabatan_dinilai,
      skor_skp: skor_skp || null,
      skor_perilaku: skor_perilaku || null,
      skor_output: skor_output || null,
      skor_disiplin: skor_disiplin || null,
      catatan_kualitatif: catatan_kualitatif || null,
      skor_eksekusi_tugas: skor_eksekusi_tugas || null,
      skor_kualitas_dokumen: skor_kualitas_dokumen || null,
      skor_kepatuhan_alur: skor_kepatuhan_alur || null,
      skor_ketepatan_laporan: skor_ketepatan_laporan || null,
      skor_total,
      kategori,
      status: "draft",
    });

    res.json({ success: true, data: record, message: created ? "SKP dibuat." : "SKP diperbarui." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/sekretaris/skp/:userId
export const getSkpHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const sekretarisId = req.user?.id;

    const history = await SkpPenilaianSekretaris.findAll({
      where: { penilai_id: sekretarisId, yang_dinilai_id: userId },
      order: [["periode_tahun", "DESC"], ["periode_bulan", "DESC"]],
      raw: true,
    }).catch(() => []);

    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST /api/sekretaris/skp/:userId/finalize
export const finalizeSkp = async (req, res) => {
  const { userId } = req.params;
  const { periode_bulan, periode_tahun } = req.body || {};
  const sekretarisId = req.user?.id;

  try {
    const skp = await SkpPenilaianSekretaris.findOne({
      where: {
        penilai_id: sekretarisId,
        yang_dinilai_id: userId,
        periode_bulan,
        periode_tahun,
        status: "draft",
      },
    });

    if (!skp) return res.status(404).json({ success: false, message: "SKP draft tidak ditemukan." });

    await skp.update({ status: "final", finalized_at: new Date() });
    res.json({ success: true, message: "SKP berhasil difinalisasi." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
