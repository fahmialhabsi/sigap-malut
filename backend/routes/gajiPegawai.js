// backend/routes/gajiPegawai.js
// Base: /api/gaji-pegawai + /api/dashboard/bendahara-gaji/*

import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { requireAnyPermission } from "../middleware/permissionCheck.js";
import GajiPegawai from "../models/GajiPegawai.js";

const router = Router();
router.use(protect);

const gajiPerm = requireAnyPermission([
  "dashboard:read",
  "bendahara_gaji:read",
  "bendahara:read",
  "sek-keu:read",
  "super_admin:read",
]);

const TAHUN = new Date().getFullYear();
const BULAN = new Date().getMonth() + 1;

// ── GET /gaji-pegawai ────────────────────────────────────────────────────────
router.get("/gaji-pegawai", gajiPerm, async (req, res) => {
  try {
    const bulan = Number(req.query.bulan) || BULAN;
    const tahun = Number(req.query.tahun) || TAHUN;
    const list = await GajiPegawai.findAll({
      where: { bulan, tahun, deleted_at: null },
      order: [["nama", "ASC"]],
      raw: true,
    });
    res.json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── GET /gaji-pegawai/laporan ─────────────────────────────────────────────────
router.get("/gaji-pegawai/laporan", gajiPerm, async (req, res) => {
  try {
    const bulan = Number(req.query.bulan) || BULAN;
    const tahun = Number(req.query.tahun) || TAHUN;
    // Placeholder — laporan gaji dihasilkan dari data bulan tersebut
    const summary = await GajiPegawai.findAll({
      where: { bulan, tahun, deleted_at: null },
      attributes: ["status"],
      raw: true,
    }).catch(() => []);
    res.json({ success: true, data: summary });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── PUT /gaji-pegawai/:id/bayar ───────────────────────────────────────────────
router.put("/gaji-pegawai/:id/bayar", gajiPerm, async (req, res) => {
  try {
    const record = await GajiPegawai.findByPk(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: "Data gaji tidak ditemukan." });
    await record.update({ status: "dibayar" });
    res.json({ success: true, message: "Gaji berhasil dicatat sebagai dibayar." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── PUT /gaji-pegawai/:id/tahan ───────────────────────────────────────────────
router.put("/gaji-pegawai/:id/tahan", gajiPerm, async (req, res) => {
  try {
    const record = await GajiPegawai.findByPk(req.params.id);
    if (!record) return res.status(404).json({ success: false, message: "Data gaji tidak ditemukan." });
    await record.update({ status: "ditahan" });
    res.json({ success: true, message: "Gaji ditahan." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── POST /gaji-pegawai/bayar-semua ────────────────────────────────────────────
router.post("/gaji-pegawai/bayar-semua", gajiPerm, async (req, res) => {
  try {
    const bulan = Number(req.body.bulan) || BULAN;
    const tahun = Number(req.body.tahun) || TAHUN;
    const [count] = await GajiPegawai.update(
      { status: "dibayar" },
      { where: { bulan, tahun, status: "pending" } }
    );
    res.json({ success: true, message: `${count} pegawai berhasil dibayar.`, count });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── GET /dashboard/bendahara-gaji/summary ─────────────────────────────────────
router.get("/dashboard/bendahara-gaji/summary", gajiPerm, async (req, res) => {
  try {
    const bulan = Number(req.query.bulan) || BULAN;
    const tahun = Number(req.query.tahun) || TAHUN;
    const list = await GajiPegawai.findAll({
      where: { bulan, tahun, deleted_at: null },
      raw: true,
    }).catch(() => []);

    const total_bruto    = list.reduce((s, g) => s + Number(g.gaji_pokok || 0) + Number(g.tunjangan || 0), 0);
    const total_potongan = list.reduce((s, g) => s + Number(g.potongan || 0), 0);
    const total_bersih   = total_bruto - total_potongan;

    res.json({
      success: true,
      data: {
        total_pegawai:  list.length,
        jml_dibayar:    list.filter((g) => g.status === "dibayar").length,
        jml_pending:    list.filter((g) => g.status === "pending").length,
        jml_ditahan:    list.filter((g) => g.status === "ditahan").length,
        total_bruto,
        total_potongan,
        total_bersih,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── GET /dashboard/bendahara-gaji/trend ───────────────────────────────────────
router.get("/dashboard/bendahara-gaji/trend", gajiPerm, async (req, res) => {
  try {
    const tahun = Number(req.query.tahun) || TAHUN;
    const BULAN_NAMA = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
    const result = [];

    for (let b = 1; b <= 12; b++) {
      const list = await GajiPegawai.findAll({
        where: { bulan: b, tahun, deleted_at: null },
        raw: true,
      }).catch(() => []);
      if (list.length === 0) continue;
      const bruto  = list.reduce((s, g) => s + Number(g.gaji_pokok || 0) + Number(g.tunjangan || 0), 0);
      const bersih = bruto - list.reduce((s, g) => s + Number(g.potongan || 0), 0);
      result.push({
        bulan:  BULAN_NAMA[b - 1],
        bruto:  Math.round(bruto / 1_000_000),
        bersih: Math.round(bersih / 1_000_000),
      });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
