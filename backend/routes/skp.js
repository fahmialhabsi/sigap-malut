// backend/routes/skp.js
// SKP (Sasaran Kinerja Pegawai) read endpoints untuk Pelaksana
//
// GET /api/skp/my          — pelaksana/staf_pelaksana melihat SKP milik sendiri
// GET /api/skp/:id         — detail satu record SKP (pemilik atau atasan)

import { Router } from "express";
import { protect } from "../middleware/auth.js";
import limiter from "../middleware/rateLimiter.js";

const router = Router();
router.use(limiter);
router.use(protect);

const SENIOR_ROLES = new Set([
  "super_admin", "kepala_dinas", "sekretaris",
  "kepala_bidang", "kasubbag", "kasubbag_umum_kepegawaian",
]);

async function getSkpModel() {
  const { default: db } = await import("../config/database.js");
  return db.models.SkpPenilaian || null;
}

// GET /api/skp/my — SKP milik user yang login
router.get("/my", async (req, res) => {
  try {
    const Skp = await getSkpModel();
    if (!Skp) {
      return res.json({ success: true, data: [], note: "Tabel SKP belum tersedia." });
    }

    const { limit = 10, tahun } = req.query;
    const where = { pegawai_id: req.user.id };
    if (tahun) where.periode_tahun = parseInt(tahun, 10);

    const data = await Skp.findAll({
      where,
      order: [
        ["periode_tahun", "DESC"],
        ["periode_semester", "DESC"],
      ],
      limit: Math.min(parseInt(limit, 10) || 10, 50),
      attributes: [
        "id", "periode_tahun", "periode_semester",
        "unit_kerja", "jabatan", "status",
        "nilai_kuantitatif", "nilai_kualitatif",
        "catatan_pegawai", "catatan_penilai",
        "submitted_at", "approved_at",
      ],
    });

    return res.json({ success: true, data });
  } catch (err) {
    console.error("[SKP MY]", err);
    return res.status(500).json({ success: false, message: "Gagal mengambil data SKP." });
  }
});

// GET /api/skp/:id — detail
router.get("/:id", async (req, res) => {
  try {
    const Skp = await getSkpModel();
    if (!Skp) return res.status(404).json({ success: false, message: "Tabel SKP belum tersedia." });

    const skp = await Skp.findByPk(req.params.id, {
      attributes: [
        "id", "pegawai_id", "penilai_id", "periode_tahun", "periode_semester",
        "unit_kerja", "jabatan", "status",
        "nilai_kuantitatif", "nilai_kualitatif",
        "catatan_pegawai", "catatan_penilai",
        "submitted_at", "approved_at", "signed_at",
      ],
    });
    if (!skp) return res.status(404).json({ success: false, message: "Data SKP tidak ditemukan." });

    const isSelf = String(skp.pegawai_id) === String(req.user.id);
    const isSenior = SENIOR_ROLES.has(req.user.role);
    if (!isSelf && !isSenior) {
      return res.status(403).json({ success: false, message: "Akses ditolak." });
    }

    return res.json({ success: true, data: skp });
  } catch (err) {
    console.error("[SKP DETAIL]", err);
    return res.status(500).json({ success: false, message: "Gagal mengambil detail SKP." });
  }
});

export default router;
