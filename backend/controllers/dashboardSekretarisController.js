// backend/controllers/dashboardSekretarisController.js
// Endpoint handlers for DashboardSekretariat.jsx + DashboardKasubag.jsx
//  GET /api/dashboard/sekretaris/kpi
//  GET /api/dashboard/sekretaris/keuangan
//  GET /api/dashboard/sekretaris/kepegawaian
//  GET /api/dashboard/sekretaris/approval-queue
//  GET /api/dashboard/kasubag/kepegawaian
//  GET /api/dashboard/kasubag/verifikasi
//  POST /api/dashboard/kasubag/verifikasi/:id/:aksi

import { Op, QueryTypes } from "sequelize";
import sequelize from "../config/database.js";
import SuratMasuk from "../models/SuratMasuk.js";
import SuratKeluar from "../models/SuratKeluar.js";
import ApprovalLog from "../models/approvalLog.js";
import Perintah from "../models/Perintah.js";
import User from "../models/User.js";

const safe = (v, fallback = 0) => (v == null || Number.isNaN(Number(v)) ? fallback : Number(v));

// ─── KPI TILES ───────────────────────────────────────────────────────────────
export const getSekretarisKPI = async (_req, res) => {
  try {
    const [
      suratBelumDisposisi,
      suratPendingTTD,
      approvalPending,
      perintahAktif,
      perintahBawahanPending,
      keuRaw,
    ] = await Promise.all([
      SuratMasuk.count({ where: { disposisi_at: null, deleted_at: null } }).catch(() => 0),
      SuratKeluar.count({ where: { ttd_sekretaris_at: null, status: { [Op.notIn]: ["draft"] }, deleted_at: null } }).catch(() => 0),
      ApprovalLog.count({ where: { action: "diajukan" } }).catch(() => 0),
      Perintah.count({ where: { ke_role: "sekretaris", status: { [Op.notIn]: ["selesai", "ditolak"] } } }).catch(() => 0),
      Perintah.count({ where: { dari_role: "sekretaris", status: { [Op.notIn]: ["selesai", "ditolak"] } } }).catch(() => 0),
      // Anggaran dari SEK-KEU (jika ada)
      sequelize.query(
        `SELECT SUM(total_anggaran) as total, SUM(total_realisasi) as realisasi
         FROM "SEK-KEU" WHERE deleted_at IS NULL`,
        { type: QueryTypes.SELECT }
      ).catch(() => [{ total: null, realisasi: null }]),
    ]);

    const keu = keuRaw[0] || {};
    const total = safe(keu.total, null);
    const realisasi = safe(keu.realisasi, null);
    const anggaran_pct = total && realisasi ? Math.round((realisasi / total) * 100) : null;

    res.json({
      success: true,
      data: {
        surat_belum_disposisi: suratBelumDisposisi,
        surat_pending_ttd: suratPendingTTD,
        approval_pending: approvalPending,
        perintah_aktif: perintahAktif,
        tugas_bawahan_pending: perintahBawahanPending,
        anggaran_pct,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── KEUANGAN ─────────────────────────────────────────────────────────────────
export const getSekretarisKeuangan = async (_req, res) => {
  try {
    const dialect = sequelize.getDialect();

    // Anggaran dari SEK-KEU
    const anggaran = await sequelize.query(
      `SELECT SUM(total_anggaran) as total_anggaran, SUM(total_realisasi) as realisasi
       FROM "SEK-KEU" WHERE deleted_at IS NULL`,
      { type: QueryTypes.SELECT }
    ).catch(() => [{}]);

    // SPP pending (dari SPJ belum disetujui)
    const sppPending = await sequelize.query(
      `SELECT COUNT(*) as cnt FROM spj WHERE status IN ('draft','diajukan') AND deleted_at IS NULL`,
      { type: QueryTypes.SELECT }
    ).catch(() => [{ cnt: 0 }]);

    // SPM pending
    const spmPending = await sequelize.query(
      `SELECT COUNT(*) as cnt FROM spj WHERE status = 'spm_proses' AND deleted_at IS NULL`,
      { type: QueryTypes.SELECT }
    ).catch(() => [{ cnt: 0 }]);

    // LPJ pending
    const lpjPending = await sequelize.query(
      `SELECT COUNT(*) as cnt FROM spj WHERE status = 'lpj_proses' AND deleted_at IS NULL`,
      { type: QueryTypes.SELECT }
    ).catch(() => [{ cnt: 0 }]);

    const a = anggaran[0] || {};
    const total = safe(a.total_anggaran, null);
    const realisasi = safe(a.realisasi, null);
    const persen_serapan = total && realisasi ? Math.round((realisasi / total) * 100) : null;

    // Sqlite vs postgres: COUNT returns string on sqlite
    const cnt = (raw) => safe((raw[0] || {}).cnt, 0);

    res.json({
      success: true,
      data: {
        total_anggaran: total,
        realisasi,
        persen_serapan,
        spp_pending: cnt(sppPending),
        spm_pending: cnt(spmPending),
        lpj_pending: cnt(lpjPending),
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── KEPEGAWAIAN ──────────────────────────────────────────────────────────────
export const getSekretarisKepegawaian = async (_req, res) => {
  try {
    const [totalPegawai, activePegawai, cutiPegawai, kgbPending, skpBelum] = await Promise.all([
      User.count({ where: { deleted_at: null } }).catch(() => 0),
      User.count({ where: { deleted_at: null, is_active: true } }).catch(() =>
        User.count({ where: { deleted_at: null } }).catch(() => 0)
      ),
      // Cuti: jika ada tabel cuti
      sequelize.query(
        `SELECT COUNT(*) as cnt FROM "SEK-HUM" WHERE status = 'cuti' AND deleted_at IS NULL`,
        { type: QueryTypes.SELECT }
      ).catch(() => [{ cnt: 0 }]),
      // KGB pending — dari SEK-KBJ
      sequelize.query(
        `SELECT COUNT(*) as cnt FROM "SEK-KBJ" WHERE status IN ('draft','diajukan') AND deleted_at IS NULL`,
        { type: QueryTypes.SELECT }
      ).catch(() => [{ cnt: 0 }]),
      // SKP belum dinilai — dari SEK-KEP
      sequelize.query(
        `SELECT COUNT(*) as cnt FROM "SEK-KEP" WHERE status IN ('belum_dinilai','draft') AND deleted_at IS NULL`,
        { type: QueryTypes.SELECT }
      ).catch(() => [{ cnt: 0 }]),
    ]);

    const cnt = (raw) => safe((raw[0] || {}).cnt, 0);

    res.json({
      success: true,
      data: {
        total: totalPegawai,
        aktif: activePegawai,
        cuti: cnt(cutiPegawai),
        kgb_pending: cnt(kgbPending),
        skp_belum: cnt(skpBelum),
        pelatihan_pending: 0, // placeholder
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── APPROVAL QUEUE ───────────────────────────────────────────────────────────
export const getApprovalQueueSekretaris = async (_req, res) => {
  try {
    // Ambil ApprovalLog dengan action=diajukan, belum ada action setujui/tolak setelahnya
    const queue = await ApprovalLog.findAll({
      where: { action: "diajukan" },
      order: [["timestamp", "DESC"]],
      limit: 50,
      raw: true,
    }).catch(() => []);

    // Filter: hanya yang belum di-resolve (tidak ada follow-up action)
    const resolvedIds = new Set(
      (await ApprovalLog.findAll({
        where: { action: { [Op.in]: ["disetujui", "ditolak", "dikembalikan"] } },
        attributes: ["layanan_id"],
        raw: true,
      }).catch(() => [])).map((r) => r.layanan_id)
    );

    const pending = queue.filter((a) => !resolvedIds.has(a.layanan_id)).map((a) => ({
      id: a.id,
      layanan_id: a.layanan_id,
      judul: a.judul || `Dokumen ${a.layanan_id}`,
      jenis: a.jenis || "approval",
      pengaju: a.pengaju || `User ${a.reviewer_id}`,
      catatan: a.catatan,
      status: "diajukan",
      created_at: a.timestamp,
    }));

    res.json({ success: true, data: pending });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── KASUBAG: KEPEGAWAIAN ─────────────────────────────────────────────────────
export const getKasubagKepegawaian = async (_req, res) => {
  try {
    const [total, cuti, kgbPending, skpBelum] = await Promise.all([
      User.count({ where: { deleted_at: null } }).catch(() => 0),
      sequelize.query(
        `SELECT COUNT(*) as cnt FROM "SEK-HUM" WHERE status = 'cuti' AND deleted_at IS NULL`,
        { type: QueryTypes.SELECT }
      ).catch(() => [{ cnt: 0 }]),
      sequelize.query(
        `SELECT COUNT(*) as cnt FROM "SEK-KBJ" WHERE status IN ('draft','diajukan') AND deleted_at IS NULL`,
        { type: QueryTypes.SELECT }
      ).catch(() => [{ cnt: 0 }]),
      sequelize.query(
        `SELECT COUNT(*) as cnt FROM "SEK-KEP" WHERE status IN ('belum_dinilai','draft') AND deleted_at IS NULL`,
        { type: QueryTypes.SELECT }
      ).catch(() => [{ cnt: 0 }]),
    ]);

    const cnt = (raw) => safe((raw[0] || {}).cnt, 0);

    // Hadir = total - cuti - izin_sakit (estimasi sederhana)
    const cutiCount = cnt(cuti);
    const hadir = Math.max(0, total - cutiCount);

    res.json({
      success: true,
      data: {
        total,
        hadir,
        cuti: cutiCount,
        kgb_pending: cnt(kgbPending),
        skp_belum: cnt(skpBelum),
        izin_sakit: 0,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── KASUBAG: DOKUMEN PERLU VERIFIKASI ───────────────────────────────────────
export const getKasubagVerifikasi = async (_req, res) => {
  try {
    // Ambil ApprovalLog dengan action=diajukan yang belum di-resolve
    const diajukan = await ApprovalLog.findAll({
      where: { action: "diajukan" },
      order: [["timestamp", "DESC"]],
      limit: 50,
      raw: true,
    }).catch(() => []);

    const resolvedIds = new Set(
      (await ApprovalLog.findAll({
        where: { action: { [Op.in]: ["disetujui", "ditolak", "dikembalikan", "terverifikasi"] } },
        attributes: ["layanan_id"],
        raw: true,
      }).catch(() => [])).map((r) => r.layanan_id)
    );

    const pending = diajukan
      .filter((a) => !resolvedIds.has(a.layanan_id))
      .map((a) => ({
        id: a.id,
        layanan_id: a.layanan_id,
        judul: a.judul || `Dokumen ${a.layanan_id}`,
        modul: a.modul || "SEK",
        pengaju: a.pengaju || `User ${a.reviewer_id}`,
        catatan_pengaju: a.catatan,
        status: "in_review",
        created_at: a.timestamp,
      }));

    res.json({ success: true, data: pending });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── KASUBAG: AKSI VERIFIKASI ─────────────────────────────────────────────────
export const kasubagVerifikasiAction = async (req, res) => {
  const { id, aksi } = req.params;
  const { catatan } = req.body || {};
  const reviewerId = req.user?.id;

  const actionMap = {
    verifikasi: "terverifikasi",
    kembalikan: "dikembalikan",
    "forward-sekretaris": "diajukan_sekretaris",
  };
  const action = actionMap[aksi];
  if (!action) return res.status(400).json({ success: false, message: "Aksi tidak valid." });

  try {
    const original = await ApprovalLog.findByPk(id);
    if (!original) return res.status(404).json({ success: false, message: "Dokumen tidak ditemukan." });

    await ApprovalLog.create({
      layanan_id: original.layanan_id,
      reviewer_id: reviewerId,
      action,
      catatan: catatan || null,
      timestamp: new Date(),
    });

    res.json({ success: true, message: `Dokumen berhasil ${aksi}.` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── APPROVAL ACTIONS ─────────────────────────────────────────────────────────
export const approveAction = async (req, res) => {
  const { id } = req.params;
  const { aksi } = req.params;
  const { catatan } = req.body || {};
  const reviewerId = req.user?.id;

  const actionMap = { setujui: "disetujui", kembalikan: "dikembalikan", tolak: "ditolak" };
  const action = actionMap[aksi];
  if (!action) return res.status(400).json({ success: false, message: "Aksi tidak valid." });

  try {
    // Ambil approval asli
    const original = await ApprovalLog.findByPk(id);
    if (!original) return res.status(404).json({ success: false, message: "Approval tidak ditemukan." });

    await ApprovalLog.create({
      layanan_id: original.layanan_id,
      reviewer_id: reviewerId,
      action,
      catatan: catatan || null,
      timestamp: new Date(),
    });

    res.json({ success: true, message: `Approval ${aksi} berhasil.` });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
