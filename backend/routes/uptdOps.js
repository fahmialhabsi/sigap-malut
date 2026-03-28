// backend/routes/uptdOps.js
// API untuk operasional UPTD: Equipment Maintenance, SOP Check, Chain of Custody (TrackingLog)
import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { Op } from "sequelize";
import EquipmentMaintenance from "../models/EquipmentMaintenance.js";
import SopCheck from "../models/SopCheck.js";
import TrackingLog from "../models/TrackingLog.js";

const router = Router();
router.use(protect);

// ─── Equipment Maintenance ────────────────────────────────────────────────────

router.get("/equipment", async (req, res) => {
  try {
    const data = await EquipmentMaintenance.findAll({
      order: [["tanggal_berikutnya", "ASC"]],
      limit: 50,
    });
    res.json({ data });
  } catch {
    res.status(500).json({ error: "Gagal mengambil data equipment." });
  }
});

router.post("/equipment", async (req, res) => {
  try {
    const user = req.user;
    const {
      nama_alat,
      kode_alat,
      tanggal_terakhir,
      tanggal_berikutnya,
      status,
      catatan,
      penanggung_jawab,
    } = req.body;

    if (!nama_alat || !String(nama_alat).trim()) {
      return res.status(400).json({ error: "Nama alat wajib diisi." });
    }
    if (nama_alat.trim().length > 200) {
      return res
        .status(400)
        .json({ error: "Nama alat terlalu panjang (maks. 200 karakter)." });
    }

    const record = await EquipmentMaintenance.create({
      nama_alat: nama_alat.trim(),
      kode_alat: kode_alat ? String(kode_alat).trim().slice(0, 50) : null,
      tanggal_terakhir: tanggal_terakhir || null,
      tanggal_berikutnya: tanggal_berikutnya || null,
      status: status ? String(status).trim().slice(0, 50) : "terjadwal",
      catatan: catatan ? String(catatan).trim().slice(0, 1000) : null,
      penanggung_jawab: penanggung_jawab
        ? String(penanggung_jawab).trim().slice(0, 100)
        : null,
      created_by_id: user.id,
    });

    res.status(201).json({ success: true, data: record });
  } catch {
    res.status(500).json({ error: "Gagal menyimpan data equipment." });
  }
});

// ─── SOP Compliance Check ────────────────────────────────────────────────────

const DEFAULT_SOP = [
  { item: "Verifikasi identitas pengirim sampel", kategori: "Penerimaan" },
  { item: "Cek kondisi fisik sampel saat tiba", kategori: "Penerimaan" },
  { item: "Pencatatan nomor sampel ke buku log", kategori: "Dokumentasi" },
  { item: "Label sampel terpasang dan terbaca", kategori: "Dokumentasi" },
  { item: "Suhu penyimpanan sesuai standar", kategori: "Penyimpanan" },
  { item: "Reagen dan bahan kimia tidak kadaluarsa", kategori: "Lab" },
  { item: "Kalibrasi alat dilakukan sesuai jadwal", kategori: "Lab" },
  { item: "Hasil analisis diverifikasi dua petugas", kategori: "Verifikasi" },
];

router.get("/sop-check", async (req, res) => {
  try {
    const existing = await SopCheck.findAll({
      order: [["checked_at", "DESC"]],
      limit: DEFAULT_SOP.length * 3,
    });
    res.json({ data: existing, defaultSop: DEFAULT_SOP });
  } catch {
    res.status(500).json({ error: "Gagal mengambil data SOP check." });
  }
});

router.post("/sop-check/bulk", async (req, res) => {
  try {
    const user = req.user;
    const { checks } = req.body;

    if (!Array.isArray(checks) || checks.length === 0) {
      return res.status(400).json({ error: "Data checks tidak valid." });
    }
    if (checks.length > 50) {
      return res.status(400).json({ error: "Terlalu banyak item (maks. 50)." });
    }

    const records = checks.map((c) => ({
      checklist_item: String(c.item ?? c.checklist_item ?? "")
        .trim()
        .slice(0, 300),
      kategori: c.kategori ? String(c.kategori).trim().slice(0, 100) : null,
      is_compliant: Boolean(c.is_compliant),
      catatan: c.catatan ? String(c.catatan).trim().slice(0, 500) : null,
      checked_by_id: user.id,
    }));

    await SopCheck.bulkCreate(records);
    res.status(201).json({ success: true, saved: records.length });
  } catch {
    res.status(500).json({ error: "Gagal menyimpan SOP check." });
  }
});

// ─── Chain of Custody (TrackingLog) ─────────────────────────────────────────

router.get("/tracking", async (req, res) => {
  try {
    const { nomor_sampel, limit = 20 } = req.query;
    const where = nomor_sampel
      ? {
          nomor_sampel: {
            [Op.like]: `%${String(nomor_sampel).slice(0, 100)}%`,
          },
        }
      : {};

    const data = await TrackingLog.findAll({
      where,
      order: [["timestamp_event", "DESC"]],
      limit: Math.min(parseInt(limit, 10) || 20, 100),
    });

    res.json({ data });
  } catch {
    res.status(500).json({ error: "Gagal mengambil data tracking." });
  }
});

router.post("/tracking", async (req, res) => {
  try {
    const user = req.user;
    const {
      nomor_sampel,
      nama_komoditas,
      asal_pengiriman,
      status,
      lokasi_sekarang,
      catatan,
    } = req.body;

    if (!nomor_sampel || !String(nomor_sampel).trim()) {
      return res.status(400).json({ error: "Nomor sampel wajib diisi." });
    }
    if (nomor_sampel.trim().length > 100) {
      return res
        .status(400)
        .json({ error: "Nomor sampel terlalu panjang (maks. 100 karakter)." });
    }

    const ALLOWED_STATUS = [
      "diterima",
      "dalam_proses",
      "selesai",
      "diarsipkan",
      "dikembalikan",
    ];
    const validStatus = ALLOWED_STATUS.includes(status) ? status : "diterima";

    const record = await TrackingLog.create({
      nomor_sampel: nomor_sampel.trim(),
      nama_komoditas: nama_komoditas
        ? String(nama_komoditas).trim().slice(0, 200)
        : null,
      asal_pengiriman: asal_pengiriman
        ? String(asal_pengiriman).trim().slice(0, 200)
        : null,
      status: validStatus,
      lokasi_sekarang: lokasi_sekarang
        ? String(lokasi_sekarang).trim().slice(0, 200)
        : null,
      petugas_id: user.id,
      catatan: catatan ? String(catatan).trim().slice(0, 500) : null,
    });

    res.status(201).json({ success: true, data: record });
  } catch {
    res.status(500).json({ error: "Gagal menyimpan tracking log." });
  }
});

export default router;
