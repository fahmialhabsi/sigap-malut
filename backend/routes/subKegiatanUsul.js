// backend/routes/subKegiatanUsul.js
// API native SIGAP untuk storing usulan sub-kegiatan dari Kepala Bidang.
import { Router } from "express";
import { protect } from "../middleware/auth.js";
import SubKegiatanUsul from "../models/SubKegiatanUsul.js";

const router = Router();
router.use(protect);

// GET: ambil daftar usulan milik user saat ini (atau filter by bidang)
router.get("/", async (req, res) => {
  try {
    const user = req.user;
    const { bidang, limit = 20 } = req.query;

    const where = bidang
      ? { bidang: String(bidang).slice(0, 100) }
      : { created_by_id: user.id };

    const data = await SubKegiatanUsul.findAll({
      where,
      order: [["created_at", "DESC"]],
      limit: Math.min(parseInt(limit, 10) || 20, 100),
    });

    res.json({ data });
  } catch {
    res
      .status(500)
      .json({ error: "Gagal mengambil data usulan sub-kegiatan." });
  }
});

// POST: tambah usulan sub-kegiatan baru
router.post("/", async (req, res) => {
  try {
    const user = req.user;
    const {
      nama_sub_kegiatan,
      sasaran,
      indikator,
      pagu_usulan,
      keterangan,
      bidang,
    } = req.body;

    // Validasi input
    if (
      !nama_sub_kegiatan ||
      typeof nama_sub_kegiatan !== "string" ||
      !nama_sub_kegiatan.trim()
    ) {
      return res.status(400).json({ error: "Nama sub-kegiatan wajib diisi." });
    }
    if (nama_sub_kegiatan.trim().length > 300) {
      return res
        .status(400)
        .json({
          error: "Nama sub-kegiatan terlalu panjang (maks. 300 karakter).",
        });
    }

    const parsedPagu = pagu_usulan ? parseFloat(pagu_usulan) : null;
    if (pagu_usulan !== undefined && pagu_usulan !== "" && isNaN(parsedPagu)) {
      return res.status(400).json({ error: "Pagu usulan harus berupa angka." });
    }

    const record = await SubKegiatanUsul.create({
      created_by_id: user.id,
      bidang: bidang
        ? String(bidang).slice(0, 100)
        : user.unit_kerja
          ? String(user.unit_kerja).slice(0, 100)
          : null,
      nama_sub_kegiatan: nama_sub_kegiatan.trim(),
      sasaran: sasaran ? String(sasaran).trim().slice(0, 500) : null,
      indikator: indikator ? String(indikator).trim().slice(0, 300) : null,
      pagu_usulan: parsedPagu,
      keterangan: keterangan ? String(keterangan).trim().slice(0, 1000) : null,
      status: "diajukan",
    });

    res.status(201).json({ success: true, data: record });
  } catch {
    res.status(500).json({ error: "Gagal menyimpan usulan sub-kegiatan." });
  }
});

export default router;
