// backend/routes/spj.js
// SPJ (Surat Pertanggungjawaban) API routes
//
// RBAC:
//   POST   /api/spj             — pelaksana, staf_pelaksana  (create)
//   PUT    /api/spj/:id/submit  — pelaksana, staf_pelaksana  (submit draft)
//   GET    /api/spj/my          — pelaksana, staf_pelaksana  (list milik sendiri)
//   GET    /api/spj/incoming    — bendahara                  (list SPJ masuk/submitted)
//   PUT    /api/spj/:id/verify  — bendahara                  (approve)
//   PUT    /api/spj/:id/reject  — bendahara                  (reject)
//   GET    /api/spj/:id         — pemilik ATAU bendahara/atas (detail)

import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import sequelize from "../config/database.js";
import { protect } from "../middleware/auth.js";
import limiter from "../middleware/rateLimiter.js";
import { chainOfCommandGuard } from "../middleware/chainOfCommand.js";

const router = Router();

// ── Pastikan folder upload ada ────────────────────────────────────────────────
const UPLOAD_DIR = path.join(path.dirname(new URL(import.meta.url).pathname), "..", "uploads", "spj");
try { fs.mkdirSync(UPLOAD_DIR.replace(/^\/([A-Z]:)/, "$1"), { recursive: true }); } catch {}

// ── Multer ────────────────────────────────────────────────────────────────────
const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
]);

const storage = multer.diskStorage({
  destination: "uploads/spj/",
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `spj_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        Object.assign(new Error("Tipe file tidak diizinkan. Gunakan PDF atau gambar."), {
          code: "INVALID_FILE_TYPE",
        }),
        false,
      );
    }
  },
});

// ── Role helpers ──────────────────────────────────────────────────────────────
const PELAKSANA_ROLES = new Set(["pelaksana", "staf_pelaksana", "super_admin"]);
const BENDAHARA_ROLES = new Set(["bendahara", "bendahara_pengeluaran", "super_admin", "sekretaris"]);
const SENIOR_ROLES   = new Set(["bendahara", "bendahara_pengeluaran", "super_admin", "sekretaris", "kepala_dinas", "kepala_bidang"]);

function onlyPelaksana(req, res, next) {
  if (PELAKSANA_ROLES.has(req.user?.role)) return next();
  return res.status(403).json({
    success: false,
    message: "Akses ditolak. Hanya pelaksana yang dapat membuat SPJ.",
  });
}

function onlyBendahara(req, res, next) {
  if (BENDAHARA_ROLES.has(req.user?.role)) return next();
  return res.status(403).json({
    success: false,
    message: "Akses ditolak. Hanya bendahara yang dapat memverifikasi SPJ.",
  });
}

// ── Ambil model Spj dari registry sequelize ────────────────────────────────────
function getSpj() {
  const Spj = sequelize.models.Spj;
  if (!Spj) {
    throw new Error("Model Spj belum terdaftar. Pastikan models/index.js diimport di server.js.");
  }
  return Spj;
}

// ── Apply global middleware ───────────────────────────────────────────────────
router.use(limiter);
router.use(protect);

// ── POST /api/spj — create SPJ baru (draft) ───────────────────────────────────
router.post("/", onlyPelaksana, upload.single("file_bukti"), async (req, res) => {
  try {
    const Spj = getSpj();
    const user = req.user;
    const { judul, kegiatan, tanggal_kegiatan, total_anggaran, keterangan, nomor_spj } = req.body;

    if (!judul?.trim())
      return res.status(400).json({ success: false, message: "Judul SPJ wajib diisi." });
    if (!kegiatan?.trim())
      return res.status(400).json({ success: false, message: "Nama kegiatan wajib diisi." });
    if (!tanggal_kegiatan)
      return res.status(400).json({ success: false, message: "Tanggal kegiatan wajib diisi." });

    const parsedAnggaran = total_anggaran ? parseFloat(total_anggaran) : 0;
    if (isNaN(parsedAnggaran) || parsedAnggaran < 0)
      return res.status(400).json({ success: false, message: "Total anggaran tidak valid." });

    const spj = await Spj.create({
      judul: judul.trim().slice(0, 300),
      kegiatan: kegiatan.trim().slice(0, 300),
      tanggal_kegiatan,
      total_anggaran: parsedAnggaran,
      keterangan: keterangan ? String(keterangan).trim().slice(0, 1000) : null,
      nomor_spj: nomor_spj ? String(nomor_spj).trim().slice(0, 100) : null,
      pelaksana_id: user.id,
      unit_kerja: user.unit_kerja || null,
      status: "draft",
      file_bukti: req.file ? req.file.path.replace(/\\/g, "/") : null,
      file_bukti_mime: req.file ? req.file.mimetype : null,
    });

    return res.status(201).json({ success: true, data: spj });
  } catch (err) {
    console.error("[SPJ CREATE]", err.message, err.stack);
    return res.status(500).json({ success: false, message: "Gagal membuat SPJ.", detail: err.message });
  }
});

// ── GET /api/spj/my — list SPJ milik pelaksana sendiri ───────────────────────
router.get("/my", async (req, res) => {
  try {
    const Spj = getSpj();
    const { limit = 20, status } = req.query;
    const where = { pelaksana_id: req.user.id };
    if (status) where.status = String(status);

    const data = await Spj.findAll({
      where,
      order: [["created_at", "DESC"]],
      limit: Math.min(parseInt(limit, 10) || 20, 100),
    });
    return res.json({ success: true, data });
  } catch (err) {
    console.error("[SPJ MY]", err.message);
    return res.status(500).json({ success: false, message: "Gagal mengambil data SPJ.", detail: err.message });
  }
});

// ── GET /api/spj/incoming — SPJ masuk untuk bendahara ────────────────────────
router.get("/incoming", onlyBendahara, async (req, res) => {
  try {
    const Spj = getSpj();
    const { limit = 30, status = "submitted" } = req.query;
    const where = {};
    if (status !== "all") where.status = String(status);

    const data = await Spj.findAll({
      where,
      order: [["submitted_at", "DESC"], ["created_at", "DESC"]],
      limit: Math.min(parseInt(limit, 10) || 30, 100),
    });
    return res.json({ success: true, data });
  } catch (err) {
    console.error("[SPJ INCOMING]", err.message);
    return res.status(500).json({ success: false, message: "Gagal mengambil SPJ masuk.", detail: err.message });
  }
});

// ── PUT /api/spj/:id/submit — pelaksana submit draft ─────────────────────────
router.put("/:id/submit", onlyPelaksana, async (req, res) => {
  try {
    const Spj = getSpj();
    const spj = await Spj.findByPk(req.params.id);
    if (!spj) return res.status(404).json({ success: false, message: "SPJ tidak ditemukan." });
    if (String(spj.pelaksana_id) !== String(req.user.id) && req.user.role !== "super_admin") {
      return res.status(403).json({ success: false, message: "Bukan SPJ Anda." });
    }
    if (spj.status !== "draft") {
      return res.status(400).json({ success: false, message: `SPJ sudah berstatus '${spj.status}', tidak bisa di-submit ulang.` });
    }
    await spj.update({ status: "submitted", submitted_at: new Date() });
    return res.json({ success: true, data: spj });
  } catch (err) {
    console.error("[SPJ SUBMIT]", err.message);
    return res.status(500).json({ success: false, message: "Gagal submit SPJ.", detail: err.message });
  }
});

// ── PUT /api/spj/:id/verify — bendahara verifikasi/approve ───────────────────
router.put("/:id/verify", onlyBendahara, chainOfCommandGuard, async (req, res) => {
  try {
    const Spj = getSpj();
    const spj = await Spj.findByPk(req.params.id);
    if (!spj) return res.status(404).json({ success: false, message: "SPJ tidak ditemukan." });
    if (spj.status !== "submitted") {
      return res.status(400).json({ success: false, message: "Hanya SPJ berstatus 'submitted' yang dapat diverifikasi." });
    }
    const catatan = req.body?.catatan_verifikasi ? String(req.body.catatan_verifikasi).trim().slice(0, 1000) : null;
    await spj.update({ status: "verified", catatan_verifikasi: catatan, verified_by: req.user.id, verified_at: new Date() });
    return res.json({ success: true, data: spj });
  } catch (err) {
    console.error("[SPJ VERIFY]", err.message);
    return res.status(500).json({ success: false, message: "Gagal verifikasi SPJ.", detail: err.message });
  }
});

// ── PUT /api/spj/:id/reject — bendahara tolak SPJ ────────────────────────────
router.put("/:id/reject", onlyBendahara, async (req, res) => {
  try {
    const Spj = getSpj();
    const spj = await Spj.findByPk(req.params.id);
    if (!spj) return res.status(404).json({ success: false, message: "SPJ tidak ditemukan." });
    if (!["submitted", "verified"].includes(spj.status)) {
      return res.status(400).json({ success: false, message: "SPJ tidak dapat ditolak dari status saat ini." });
    }
    const alasan = req.body?.catatan_verifikasi ? String(req.body.catatan_verifikasi).trim().slice(0, 1000) : "Ditolak oleh bendahara.";
    await spj.update({ status: "rejected", catatan_verifikasi: alasan, verified_by: req.user.id, verified_at: new Date() });
    return res.json({ success: true, data: spj });
  } catch (err) {
    console.error("[SPJ REJECT]", err.message);
    return res.status(500).json({ success: false, message: "Gagal menolak SPJ.", detail: err.message });
  }
});

// ── GET /api/spj/:id — detail SPJ ────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const Spj = getSpj();
    const spj = await Spj.findByPk(req.params.id);
    if (!spj) return res.status(404).json({ success: false, message: "SPJ tidak ditemukan." });
    const isSelf   = String(spj.pelaksana_id) === String(req.user.id);
    const isSenior = SENIOR_ROLES.has(req.user.role);
    if (!isSelf && !isSenior) return res.status(403).json({ success: false, message: "Akses ditolak." });
    return res.json({ success: true, data: spj });
  } catch (err) {
    console.error("[SPJ DETAIL]", err.message);
    return res.status(500).json({ success: false, message: "Gagal mengambil detail SPJ.", detail: err.message });
  }
});

// ── Multer error handler ──────────────────────────────────────────────────────
router.use((err, _req, res, next) => {
  if (err?.code === "INVALID_FILE_TYPE")
    return res.status(400).json({ success: false, message: err.message });
  if (err?.code === "LIMIT_FILE_SIZE")
    return res.status(400).json({ success: false, message: "Ukuran file melebihi batas 10 MB." });
  next(err);
});

export default router;
