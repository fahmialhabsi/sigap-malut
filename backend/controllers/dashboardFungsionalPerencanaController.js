// backend/controllers/dashboardFungsionalPerencanaController.js
// GET /api/dashboard/fungsional-perencana/summary
// GET /api/dashboard/fungsional-perencana/program-chart
// GET /api/dashboard/fungsional-perencana/koordinasi
// GET /api/dashboard/fungsional-perencana/dokumen-pending

import { Op } from "sequelize";
import ProgramKegiatan from "../models/ProgramKegiatan.js";
import DokumenPerencanaan from "../models/DokumenPerencanaan.js";

const safe = (v, fb = 0) => (v == null || Number.isNaN(Number(v)) ? fb : Number(v));

const BIDANG_LIST = ["sekretariat", "ketersediaan", "distribusi", "konsumsi", "uptd"];
const TAHUN = new Date().getFullYear();

// ─── SUMMARY KPI ─────────────────────────────────────────────────────────────
export const getFungsionalPerencanaSummary = async (_req, res) => {
  try {
    const [program, dokumen] = await Promise.all([
      ProgramKegiatan.findAll({ where: { tahun_anggaran: TAHUN, deleted_at: null }, raw: true }).catch(() => []),
      DokumenPerencanaan.findAll({ where: { deleted_at: null }, raw: true }).catch(() => []),
    ]);

    const totalProgram = program.length;
    const realisasiRata = totalProgram
      ? Math.round(program.reduce((s, p) => s + safe(p.realisasi_fisik), 0) / totalProgram)
      : null;
    const deviasi = program.filter((p) => safe(p.target_fisik) - safe(p.realisasi_fisik) > 10).length;
    const dokDraft = dokumen.filter((d) => ["draft", "in_review"].includes(d.status)).length;

    // Laporan tepat waktu — hitung dari published vs total
    const dokPublished = dokumen.filter((d) => d.status === "published").length;
    const lap_tepat_waktu_pct = dokumen.length
      ? Math.round((dokPublished / dokumen.length) * 100)
      : null;

    res.json({
      success: true,
      data: {
        realisasi_pct: realisasiRata,
        deviasi_program: deviasi,
        dok_draft_pending: dokDraft,
        total_program: totalProgram,
        lap_tepat_waktu_pct,
        kegiatan_tepat_waktu_pct: null, // placeholder
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── PROGRAM CHART DATA ───────────────────────────────────────────────────────
export const getProgramChart = async (_req, res) => {
  try {
    const program = await ProgramKegiatan.findAll({
      where: { tahun_anggaran: TAHUN, deleted_at: null },
      raw: true,
    }).catch(() => []);

    // Group by bidang — ambil rata-rata realisasi per bidang
    const byBidang = {};
    for (const p of program) {
      const b = p.bidang || "lainnya";
      if (!byBidang[b]) byBidang[b] = { target: [], realisasi: [], anggaran: 0, real_ang: 0 };
      byBidang[b].target.push(safe(p.target_fisik));
      byBidang[b].realisasi.push(safe(p.realisasi_fisik));
      byBidang[b].anggaran += safe(p.anggaran_pagu);
      byBidang[b].real_ang += safe(p.anggaran_realisasi);
    }

    const avg = (arr) => arr.length ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length) : 0;

    const chart = Object.entries(byBidang).map(([bidang, d]) => ({
      bidang,
      target_fisik: avg(d.target),
      realisasi_fisik: avg(d.realisasi),
      anggaran_pagu: d.anggaran,
      anggaran_realisasi: d.real_ang,
    }));

    res.json({ success: true, data: chart });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── KOORDINASI BIDANG ────────────────────────────────────────────────────────
export const getKoordinasiBidang = async (_req, res) => {
  try {
    // Cek apakah masing-masing bidang sudah punya program entry tahun ini
    const program = await ProgramKegiatan.findAll({
      where: { tahun_anggaran: TAHUN, deleted_at: null },
      attributes: ["bidang", "updated_at"],
      raw: true,
    }).catch(() => []);

    const bidangMap = {};
    for (const p of program) {
      const b = p.bidang?.toLowerCase();
      if (!bidangMap[b] || new Date(p.updated_at) > new Date(bidangMap[b])) {
        bidangMap[b] = p.updated_at;
      }
    }

    const LABEL = {
      sekretariat: "Sekretariat", ketersediaan: "Bidang Ketersediaan",
      distribusi: "Bidang Distribusi", konsumsi: "Bidang Konsumsi", uptd: "UPTD",
    };

    const result = BIDANG_LIST.map((key) => ({
      key,
      label: LABEL[key] || key,
      data_masuk: !!bidangMap[key],
      terakhir_update: bidangMap[key] || null,
    }));

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── DOKUMEN PENDING ──────────────────────────────────────────────────────────
export const getDokumenPending = async (_req, res) => {
  try {
    const dokumen = await DokumenPerencanaan.findAll({
      where: { status: { [Op.in]: ["draft", "in_review"] }, deleted_at: null },
      order: [["created_at", "DESC"]],
      raw: true,
    }).catch(() => []);

    res.json({ success: true, data: dokumen });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── CRUD PROGRAM KEGIATAN ────────────────────────────────────────────────────
export const listProgramKegiatan = async (req, res) => {
  try {
    const { bidang, tahun, status } = req.query;
    const where = { deleted_at: null };
    if (bidang) where.bidang = bidang;
    if (tahun) where.tahun_anggaran = Number(tahun);
    if (status) where.status = status;
    else where.tahun_anggaran = TAHUN;

    const list = await ProgramKegiatan.findAll({ where, order: [["bidang", "ASC"]], raw: true });
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateRealisasiProgram = async (req, res) => {
  try {
    const { id } = req.params;
    const { realisasi_fisik, anggaran_realisasi, catatan } = req.body;
    const record = await ProgramKegiatan.findByPk(id);
    if (!record) return res.status(404).json({ success: false, message: "Program tidak ditemukan." });

    await record.update({
      ...(realisasi_fisik != null && { realisasi_fisik }),
      ...(anggaran_realisasi != null && { anggaran_realisasi }),
      ...(catatan && { catatan }),
    });
    res.json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ─── CRUD DOKUMEN PERENCANAAN ─────────────────────────────────────────────────
export const listDokumen = async (req, res) => {
  try {
    const { status, jenis } = req.query;
    const where = { deleted_at: null };
    if (status) where.status = status;
    if (jenis) where.jenis_dokumen = jenis;

    const list = await DokumenPerencanaan.findAll({
      where, order: [["created_at", "DESC"]], raw: true,
    });
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createDokumen = async (req, res) => {
  try {
    const { jenis_dokumen, judul, periode, catatan } = req.body;
    if (!jenis_dokumen || !judul) {
      return res.status(400).json({ success: false, message: "jenis_dokumen dan judul wajib diisi." });
    }
    const dok = await DokumenPerencanaan.create({
      jenis_dokumen, judul, periode: periode || null,
      catatan: catatan || null,
      dibuat_oleh: req.user?.id || 0,
      status: "draft",
    });
    res.status(201).json({ success: true, data: dok });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const submitDokumen = async (req, res) => {
  try {
    const { id } = req.params;
    const dok = await DokumenPerencanaan.findByPk(id);
    if (!dok) return res.status(404).json({ success: false, message: "Dokumen tidak ditemukan." });
    if (dok.status !== "draft") {
      return res.status(400).json({ success: false, message: "Hanya dokumen draft yang bisa disubmit." });
    }
    await dok.update({ status: "in_review" });
    res.json({ success: true, data: dok, message: "Dokumen berhasil disubmit ke Kasubag." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateDokumen = async (req, res) => {
  try {
    const { id } = req.params;
    const dok = await DokumenPerencanaan.findByPk(id);
    if (!dok) return res.status(404).json({ success: false, message: "Dokumen tidak ditemukan." });
    if (!["draft", "dikembalikan"].includes(dok.status)) {
      return res.status(400).json({ success: false, message: "Dokumen tidak bisa diedit pada status ini." });
    }
    const { judul, periode, catatan, file_url } = req.body;
    await dok.update({ judul: judul || dok.judul, periode: periode || dok.periode, catatan: catatan || dok.catatan, file_url: file_url || dok.file_url });
    res.json({ success: true, data: dok });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
