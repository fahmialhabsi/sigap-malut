// backend/routes/barangBarang.js
// Routes untuk Bendahara Barang: persediaan, aset BMD, pengadaan, mutasi
// Base paths: /api/barang-*, /api/dashboard/bendahara-barang/*

import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { requireAnyPermission } from "../middleware/permissionCheck.js";

const router = Router();
router.use(protect);

const barangPerm = requireAnyPermission([
  "dashboard:read",
  "bendahara_barang:read",
  "bendahara:read",
  "sek-ast:read",
  "super_admin:read",
]);

const editPerm = requireAnyPermission([
  "bendahara_barang:write",
  "bendahara:write",
  "sek-ast:write",
  "super_admin:write",
]);

// ── Helpers ───────────────────────────────────────────────────────────────────
async function getDb() {
  return (await import("../config/database.js")).default;
}
async function getQ() {
  return (await import("sequelize")).QueryTypes;
}

// ── GET /barang-persediaan ────────────────────────────────────────────────────
router.get("/barang-persediaan", barangPerm, async (req, res) => {
  try {
    const db = await getDb();
    const Q  = await getQ();
    const rows = await db.query(
      `SELECT * FROM barang_persediaan WHERE deleted_at IS NULL ORDER BY nama ASC`,
      { type: Q.SELECT }
    ).catch(() => []);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── GET /barang-aset ──────────────────────────────────────────────────────────
router.get("/barang-aset", barangPerm, async (req, res) => {
  try {
    const db = await getDb();
    const Q  = await getQ();
    const { kondisi } = req.query;
    const where = kondisi ? `AND kondisi = '${kondisi.replace(/'/g, "''")}'` : "";
    const rows = await db.query(
      `SELECT * FROM barang_aset WHERE deleted_at IS NULL ${where} ORDER BY nama ASC`,
      { type: Q.SELECT }
    ).catch(() => []);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── PUT /barang-aset/:id/kondisi ──────────────────────────────────────────────
router.put("/barang-aset/:id/kondisi", editPerm, async (req, res) => {
  try {
    const db = await getDb();
    const Q  = await getQ();
    const { kondisi } = req.body;
    const VALID = ["baik", "rusak_ringan", "rusak_berat"];
    if (!VALID.includes(kondisi)) {
      return res.status(400).json({ success: false, message: "Kondisi tidak valid." });
    }
    await db.query(
      `UPDATE barang_aset SET kondisi = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL`,
      { replacements: [kondisi, req.params.id], type: Q.UPDATE }
    );
    res.json({ success: true, message: "Kondisi aset diperbarui." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── GET /barang-pengadaan ─────────────────────────────────────────────────────
router.get("/barang-pengadaan", barangPerm, async (req, res) => {
  try {
    const db = await getDb();
    const Q  = await getQ();
    const { status } = req.query;
    const where = status ? `AND status = '${status.replace(/'/g, "''")}'` : "";
    const rows = await db.query(
      `SELECT * FROM barang_pengadaan WHERE deleted_at IS NULL ${where} ORDER BY tgl_mulai DESC`,
      { type: Q.SELECT }
    ).catch(() => []);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── GET /barang-mutasi ────────────────────────────────────────────────────────
router.get("/barang-mutasi", barangPerm, async (req, res) => {
  try {
    const db = await getDb();
    const Q  = await getQ();
    const limit = Number(req.query.limit) || 50;
    const rows = await db.query(
      `SELECT * FROM barang_mutasi WHERE deleted_at IS NULL ORDER BY tgl DESC LIMIT ?`,
      { replacements: [limit], type: Q.SELECT }
    ).catch(() => []);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── POST /barang-mutasi ───────────────────────────────────────────────────────
router.post("/barang-mutasi", editPerm, async (req, res) => {
  try {
    const db = await getDb();
    const Q  = await getQ();
    const { nama_barang, jumlah, satuan, jenis, tujuan_asal, keterangan, tgl } = req.body;
    if (!nama_barang || !jumlah || !jenis) {
      return res.status(400).json({ success: false, message: "nama_barang, jumlah, dan jenis wajib diisi." });
    }
    const VALID_JENIS = ["masuk","keluar","transfer","penghapusan"];
    if (!VALID_JENIS.includes(jenis)) {
      return res.status(400).json({ success: false, message: "Jenis mutasi tidak valid." });
    }
    const id = crypto.randomUUID();
    await db.query(
      `INSERT INTO barang_mutasi (id, tgl, nama_barang, jumlah, satuan, jenis, tujuan_asal, keterangan, dicatat_oleh, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      {
        replacements: [
          id,
          tgl || new Date().toISOString().slice(0, 10),
          nama_barang, jumlah, satuan || null, jenis,
          tujuan_asal || null, keterangan || null,
          req.user?.id || null,
        ],
        type: Q.INSERT,
      }
    );
    res.status(201).json({ success: true, message: "Mutasi barang dicatat.", id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── GET /dashboard/bendahara-barang/summary ───────────────────────────────────
router.get("/dashboard/bendahara-barang/summary", barangPerm, async (req, res) => {
  try {
    const db = await getDb();
    const Q  = await getQ();

    const [persRows, asetRows, pengRows] = await Promise.all([
      db.query(`SELECT stok, stok_min FROM barang_persediaan WHERE deleted_at IS NULL`, { type: Q.SELECT }).catch(() => []),
      db.query(`SELECT nilai, jumlah FROM barang_aset WHERE deleted_at IS NULL`, { type: Q.SELECT }).catch(() => []),
      db.query(`SELECT status FROM barang_pengadaan WHERE deleted_at IS NULL`, { type: Q.SELECT }).catch(() => []),
    ]);

    const stok_minim       = persRows.filter((p) => Number(p.stok) <= Number(p.stok_min)).length;
    const nilai_aset       = asetRows.reduce((s, a) => s + Number(a.nilai || 0) * Number(a.jumlah || 1), 0);
    const pengadaan_proses = pengRows.filter((p) => p.status === "proses").length;

    res.json({
      success: true,
      data: {
        total_persediaan: persRows.length,
        stok_minim,
        total_aset:       asetRows.length,
        nilai_aset,
        pengadaan_proses,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ── GET /dashboard/bendahara-barang/laporan ───────────────────────────────────
router.get("/dashboard/bendahara-barang/laporan", barangPerm, async (_req, res) => {
  // Placeholder — laporan barang dari sistem SIMDA-BMD eksternal
  res.json({ success: true, data: [] });
});

export default router;
