// backend/controllers/dashboardFungsionalKeuanganController.js
// Dashboard endpoints for Fungsional Analis Keuangan / PPK role

import { Op } from "sequelize";
import RekeningAnggaran from "../models/RekeningAnggaran.js";
import GajiPegawai from "../models/GajiPegawai.js";

const safe = (v, fb = 0) => (v == null || Number.isNaN(Number(v)) ? fb : Number(v));
const TAHUN = new Date().getFullYear();
const BULAN = new Date().getMonth() + 1;

// ── GET /dashboard/fungsional-analis/summary ──────────────────────────────────
export const getFungsionalAnalisSummary = async (_req, res) => {
  try {
    const db = (await import("../config/database.js")).default;
    const { QueryTypes } = await import("sequelize");

    const [rekening, gaji] = await Promise.all([
      RekeningAnggaran.findAll({
        where: { tahun_anggaran: TAHUN, deleted_at: null },
        raw: true,
      }).catch(() => []),
      GajiPegawai.findAll({
        where: { tahun: TAHUN, bulan: BULAN, deleted_at: null },
        raw: true,
      }).catch(() => []),
    ]);

    const totalPagu = rekening.reduce((s, r) => s + safe(r.pagu), 0);
    const totalReal = rekening.reduce((s, r) => s + safe(r.realisasi), 0);
    const realisasi_pct = totalPagu > 0 ? Math.round((totalReal / totalPagu) * 100) : null;

    // SPP pending — count from spj table
    const sppRows = await db
      .query(
        `SELECT COUNT(*) AS cnt FROM spj
         WHERE status IN ('diajukan','pending','submitted')
           AND (deleted_at IS NULL)`,
        { type: QueryTypes.SELECT }
      )
      .catch(() => [{ cnt: 0 }]);
    const spp_pending = Number(sppRows[0]?.cnt || 0);

    // SPM bulan ini
    const spmRows = await db
      .query(
        `SELECT COUNT(*) AS cnt FROM spj
         WHERE spm_nomor IS NOT NULL
           AND spm_tanggal >= date('now', 'start of month')
           AND (deleted_at IS NULL)`,
        { type: QueryTypes.SELECT }
      )
      .catch(() => [{ cnt: 0 }]);
    const spm_bulan = Number(spmRows[0]?.cnt || 0);

    // Saldo kas / UP — simplified: pagu - realisasi for belanja_barang
    const saldo_kas = totalPagu - totalReal;

    // Laporan pending
    const lapRows = await db
      .query(
        `SELECT COUNT(*) AS cnt FROM spj
         WHERE jenis = 'laporan'
           AND status IN ('draft','diajukan')
           AND (deleted_at IS NULL)`,
        { type: QueryTypes.SELECT }
      )
      .catch(() => [{ cnt: 0 }]);
    const lap_pending = Number(lapRows[0]?.cnt || 0);

    res.json({
      success: true,
      data: {
        realisasi_pct,
        spp_pending,
        spm_bulan,
        saldo_kas,
        lap_pending,
        total_rekening: rekening.length,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── GET /dashboard/fungsional-analis/spp-pending ──────────────────────────────
export const getSppPending = async (_req, res) => {
  try {
    const db = (await import("../config/database.js")).default;
    const { QueryTypes } = await import("sequelize");

    const rows = await db
      .query(
        `SELECT id, nomor_spj AS nomor, nomor_spp, kegiatan, nilai, total_anggaran,
                pptk_nama, status, spm_nomor, spm_tanggal, sp2d_nomor, sp2d_nilai, created_at
         FROM spj
         WHERE status IN ('diajukan','pending','submitted','diverifikasi')
           AND (deleted_at IS NULL)
         ORDER BY created_at ASC
         LIMIT 50`,
        { type: QueryTypes.SELECT }
      )
      .catch(() => []);

    // Normalise: use total_anggaran as nilai fallback
    const data = rows.map((r) => ({
      ...r,
      nilai: r.nilai || r.total_anggaran,
    }));

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── GET /dashboard/fungsional-analis/gaji-status ─────────────────────────────
export const getGajiStatus = async (_req, res) => {
  try {
    const { tahun = TAHUN, bulan = BULAN } = {};
    const list = await GajiPegawai.findAll({
      where: { tahun, bulan, deleted_at: null },
      order: [["nama", "ASC"]],
      raw: true,
    }).catch(() => []);
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── GET /rekening-anggaran ────────────────────────────────────────────────────
export const listRekeningAnggaran = async (req, res) => {
  try {
    const { tahun, unit_kerja } = req.query;
    const where = { deleted_at: null };
    if (tahun) where.tahun_anggaran = Number(tahun);
    else where.tahun_anggaran = TAHUN;
    if (unit_kerja) where.unit_kerja = unit_kerja;

    const list = await RekeningAnggaran.findAll({
      where,
      order: [["kode", "ASC"]],
      raw: true,
    });
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── PUT /spj/:id/verifikasi-ppk ───────────────────────────────────────────────
export const verifikasiPPK = async (req, res) => {
  try {
    const db = (await import("../config/database.js")).default;
    const { QueryTypes } = await import("sequelize");

    const rows = await db.query(
      `SELECT id, status FROM spj WHERE id = ? AND deleted_at IS NULL`,
      { replacements: [req.params.id], type: QueryTypes.SELECT }
    ).catch(() => []);

    if (!rows.length) return res.status(404).json({ success: false, message: "SPJ tidak ditemukan." });
    if (!["diajukan", "pending", "submitted"].includes(rows[0].status)) {
      return res.status(400).json({ success: false, message: "Status SPJ tidak memungkinkan verifikasi PPK." });
    }

    await db.query(
      `UPDATE spj SET status = 'diverifikasi', ppk_verified_at = CURRENT_TIMESTAMP,
       ppk_user_id = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      { replacements: [req.user?.id || null, req.params.id], type: QueryTypes.UPDATE }
    );

    res.json({ success: true, message: "SPP berhasil diverifikasi oleh PPK." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── PUT /spj/:id/kembalikan-ppk ───────────────────────────────────────────────
export const kembalikanPPK = async (req, res) => {
  try {
    const db = (await import("../config/database.js")).default;
    const { QueryTypes } = await import("sequelize");

    const { catatan } = req.body;
    await db.query(
      `UPDATE spj SET status = 'dikembalikan', ppk_catatan = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND deleted_at IS NULL`,
      { replacements: [catatan || null, req.params.id], type: QueryTypes.UPDATE }
    );

    res.json({ success: true, message: "SPP dikembalikan ke PPTK." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── POST /spj/:id/terbitkan-spm ───────────────────────────────────────────────
export const terbitkanSPM = async (req, res) => {
  try {
    const db = (await import("../config/database.js")).default;
    const { QueryTypes } = await import("sequelize");

    const rows = await db.query(
      `SELECT id, status, nomor_spj FROM spj WHERE id = ? AND deleted_at IS NULL`,
      { replacements: [req.params.id], type: QueryTypes.SELECT }
    ).catch(() => []);

    if (!rows.length) return res.status(404).json({ success: false, message: "SPJ tidak ditemukan." });
    if (rows[0].status !== "diverifikasi") {
      return res.status(400).json({ success: false, message: "SPP harus diverifikasi PPK sebelum SPM diterbitkan." });
    }

    const tahun = new Date().getFullYear();
    const spmNomor = `SPM-${tahun}-${Date.now().toString().slice(-6)}`;

    await db.query(
      `UPDATE spj SET spm_nomor = ?, spm_tanggal = date('now'), status = 'spm_diterbitkan',
       updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      { replacements: [spmNomor, req.params.id], type: QueryTypes.UPDATE }
    );

    res.json({ success: true, message: "SPM berhasil diterbitkan.", data: { spm_nomor: spmNomor } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ── PUT /spj/:id/input-sp2d ───────────────────────────────────────────────────
export const inputSP2D = async (req, res) => {
  try {
    const db = (await import("../config/database.js")).default;
    const { QueryTypes } = await import("sequelize");

    const { sp2d_nomor, sp2d_tanggal, sp2d_nilai } = req.body;
    if (!sp2d_nomor || !sp2d_tanggal) {
      return res.status(400).json({ success: false, message: "sp2d_nomor dan sp2d_tanggal wajib diisi." });
    }

    await db.query(
      `UPDATE spj SET sp2d_nomor = ?, sp2d_tanggal = ?, sp2d_nilai = ?, status = 'sp2d_cair',
       updated_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL`,
      { replacements: [sp2d_nomor, sp2d_tanggal, sp2d_nilai || null, req.params.id], type: QueryTypes.UPDATE }
    );

    res.json({ success: true, message: "Data SP2D berhasil diinput." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
