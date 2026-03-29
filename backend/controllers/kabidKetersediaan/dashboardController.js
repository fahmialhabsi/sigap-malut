// backend/controllers/kabidKetersediaan/dashboardController.js
// KPI summary + EWS ringkasan untuk hero tiles Dashboard Kepala Bidang Ketersediaan

import { Op, QueryTypes } from "sequelize";
import sequelize from "../../config/database.js";
import Perintah from "../../models/Perintah.js";
import AnalisaJfKetersediaan from "../../models/AnalisaJfKetersediaan.js";
import EwsKetersediaan from "../../models/EwsKetersediaan.js";
import StokPangan from "../../models/StokPangan.js";
import KerawananPangan from "../../models/KerawananPangan.js";

const safe = (v, fb = 0) => (v == null || Number.isNaN(Number(v)) ? fb : Number(v));

// GET /api/kabid-ketersediaan/dashboard/summary
export const getDashboardSummary = async (req, res) => {
  try {
    const now = new Date();

    const [
      tugasAktif,       // Tugas yang Kabid beri ke JF, belum selesai
      laporanPending,   // Analisa JF menunggu review Kabid
      ewsAktif,         // Alert EWS aktif
      kabRawan,         // Kabupaten dengan status rawan/sangat_rawan
      stokKritis,       // Gudang dengan stok kritis
      dikembalikanSekretaris, // Dokumen yang dikembalikan Sekretaris
    ] = await Promise.all([
      Perintah.count({
        where: { dari_role: "kepala_bidang_ketersediaan", status: { [Op.notIn]: ["selesai", "ditolak"] } },
      }).catch(() => 0),
      AnalisaJfKetersediaan.count({
        where: { status: "diajukan_kabid", deleted_at: null },
      }).catch(() => 0),
      EwsKetersediaan.count({
        where: { status: "aktif", deleted_at: null },
      }).catch(() => 0),
      // Kabupaten rawan bulan ini
      sequelize.query(
        `SELECT COUNT(DISTINCT kabupaten_kota) as cnt FROM kerawanan_pangan
         WHERE status_kerawanan IN ('rawan','sangat_rawan') AND deleted_at IS NULL`,
        { type: QueryTypes.SELECT }
      ).then((r) => safe(r[0]?.cnt)).catch(() => 0),
      StokPangan.count({
        where: { status_stok: "kritis", deleted_at: null },
      }).catch(() => 0),
      AnalisaJfKetersediaan.count({
        where: { status: "dikembalikan", deleted_at: null },
      }).catch(() => 0),
    ]);

    // Realisasi anggaran (from BKT-* tables if available)
    const anggaranRaw = await sequelize.query(
      `SELECT SUM(total_anggaran) as total, SUM(total_realisasi) as realisasi
       FROM "BKT-PGD" WHERE deleted_at IS NULL`,
      { type: QueryTypes.SELECT }
    ).catch(() => [{}]);
    const ang = anggaranRaw[0] || {};
    const realisasi_pct = ang.total && ang.realisasi
      ? Math.round((Number(ang.realisasi) / Number(ang.total)) * 100) : null;

    res.json({
      success: true,
      data: {
        tugas_aktif_tim: tugasAktif,
        laporan_pending_review: laporanPending,
        ews_alert_aktif: ewsAktif,
        kab_rawan: kabRawan,
        stok_kritis: stokKritis,
        dikembalikan_sekretaris: dikembalikanSekretaris,
        realisasi_anggaran_pct: realisasi_pct,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/kabid-ketersediaan/dashboard/ews
export const getEwsDashboard = async (req, res) => {
  try {
    const aktif = await EwsKetersediaan.findAll({
      where: { status: "aktif", deleted_at: null },
      order: [
        [sequelize.literal(`CASE WHEN level_alert='kritis' THEN 1 WHEN level_alert='warning' THEN 2 ELSE 3 END`), "ASC"],
        ["tanggal_alert", "DESC"],
      ],
      limit: 20,
      raw: true,
    }).catch(() => []);

    // Status stok beras (indikator utama)
    const stokBeras = await StokPangan.findAll({
      where: { deleted_at: null },
      order: [["tanggal_update", "DESC"]],
      limit: 10,
      raw: true,
    }).catch(() => []);

    // Ringkasan per jenis indikator
    const byJenis = {};
    for (const a of aktif) {
      if (!byJenis[a.jenis_indikator]) byJenis[a.jenis_indikator] = [];
      byJenis[a.jenis_indikator].push(a);
    }

    res.json({
      success: true,
      data: {
        alert_aktif: aktif,
        by_jenis: byJenis,
        stok_beras: stokBeras,
        total_warning: aktif.filter((a) => a.level_alert === "warning").length,
        total_kritis: aktif.filter((a) => a.level_alert === "kritis").length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
