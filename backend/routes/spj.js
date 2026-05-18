/**
 * Routes SPJ — mencakup semua role yang terlibat dalam alur SPJ.
 *
 * Prefix: /api/spj
 *
 * Role yang dilayani:
 * - Pelaksana / PPTK    → buat, update, finalisasi, submit SPJ
 * - Pejabat (semua)     → konfirmasi / tolak SPJ atas namanya
 * - Bendahara Pengeluaran → verifikasi, kembalikan, kirim ke PPK
 * - PPK-SKPD (Sekretaris/JF Keuangan) → queue, terima/kembalikan, terbitkan SPM
 */
import express from "express";
import { protect } from "../middleware/auth.js";
import spjSelfGuard from "../middleware/spjSelfGuard.js";

import * as pelaksanaCtrl from "../controllers/pelaksanaSekretariat/spjController.js";
import * as pejabatCtrl from "../controllers/pejabat/spjKonfirmasiController.js";
import * as bendaharaCtrl from "../controllers/bendaharaPengeluaran/spjController.js";
import * as ppkCtrl from "../controllers/jfKeuangan/ppkQueueController.js";

const router = express.Router();
router.use(protect);

// ── PPTK — daftar pejabat yang bisa dibuatkan SPJ delegasi ─────────────────
router.get("/pejabat-eligible", pelaksanaCtrl.getPejabatEligible);

// ── PELAKSANA / PPTK ────────────────────────────────────────────────────────
// Kondisi A — SPJ mandiri untuk diri sendiri
router.get("/saya", pelaksanaCtrl.listSpjSaya);
router.get("/saya/stats", pelaksanaCtrl.statsSaya);
router.get("/saya/:id", pelaksanaCtrl.getSpjDetail);
router.post("/saya", spjSelfGuard, pelaksanaCtrl.createSpj);
router.put("/saya/:id", pelaksanaCtrl.updateSpj);
router.post("/saya/:id/submit", pelaksanaCtrl.submitKeBendahara);
router.get("/saya/dikembalikan", pelaksanaCtrl.listSpjDikembalikan);

// Kondisi B — SPJ delegasi atas nama pejabat (hanya PPTK)
router.post("/delegasi", spjSelfGuard, pelaksanaCtrl.createSpjDelegasi);
router.post("/delegasi/:id/finalisasi", pelaksanaCtrl.finalisasiDraftDelegasi);
router.put("/delegasi/:id", pelaksanaCtrl.updateSpj);
router.post("/delegasi/:id/submit", pelaksanaCtrl.submitKeBendahara);

// ── PEJABAT (konfirmasi SPJ atas nama diri sendiri) ─────────────────────────
router.get("/atas-nama-saya", pejabatCtrl.listSpjAtasNamaSaya);
router.get("/atas-nama-saya/pending-count", pejabatCtrl.countPendingKonfirmasi);
router.get("/atas-nama-saya/:id", pejabatCtrl.getSpjUntukKonfirmasi);
router.post("/atas-nama-saya/:id/konfirmasi", pejabatCtrl.konfirmasiSpj);
router.post("/atas-nama-saya/:id/tolak", pejabatCtrl.tolakSpj);

// ── BENDAHARA PENGELUARAN ───────────────────────────────────────────────────
router.get("/bendahara/masuk", bendaharaCtrl.listSpjMasuk);
router.get("/bendahara/dikembalikan-ppk", bendaharaCtrl.listDikembalikanPpk);
router.get("/bendahara/siap-dibayar", bendaharaCtrl.listSiapDibayar);
router.post("/bendahara/:id/verifikasi-ok", bendaharaCtrl.verifikasiOk);
router.post("/bendahara/:id/kembalikan", bendaharaCtrl.kembalikanKePelaksana);
router.post("/bendahara/:id/kirim-ppk", bendaharaCtrl.kirimKePpk);

// ── PPK-SKPD (Sekretaris / JF Keuangan) ────────────────────────────────────
router.get("/ppk/antrian", ppkCtrl.listQueue);
router.get("/ppk/:spjId", ppkCtrl.getDetail);
router.post("/ppk/:spjId/terima", ppkCtrl.terima);
router.post("/ppk/:spjId/kembalikan", ppkCtrl.kembalikan);
router.post("/ppk/:spjId/tolak", ppkCtrl.tolak);

// ── TERBITKAN SPM (PPK-SKPD setelah verifikasi OK) ─────────────────────────
// SPM diterbitkan PPK-SKPD: tambahkan nomor_spm ke SPJ yang sudah terverifikasi
router.post("/ppk/:spjId/terbitkan-spm", async (req, res) => {
  try {
    const Spj = (await import("../models/Spj.js")).default;
    const row = await Spj.findByPk(req.params.spjId);
    if (!row) return res.status(404).json({ success: false, message: "SPJ tidak ditemukan" });
    if (row.status !== "terverifikasi_ppk") {
      return res.status(400).json({ success: false, message: "SPJ harus terverifikasi PPK terlebih dahulu" });
    }
    const { nomor_spm } = req.body || {};
    if (!nomor_spm) return res.status(400).json({ success: false, message: "nomor_spm wajib diisi" });

    row.nomor_spm = nomor_spm;
    row.tanggal_spm = req.body.tanggal_spm || new Date().toISOString().slice(0, 10);
    row.status = "selesai_ppk"; // Selesai di level SIGAP-MALUT (PA tanda tangan di luar sistem)
    await row.save();

    return res.json({
      success: true,
      message: `SPM ${nomor_spm} diterbitkan. SPJ dinyatakan selesai di SIGAP-MALUT. PA/KPA dapat menandatangani SPM dan memproses SP2D melalui SIPD/SIMDA.`,
      data: { id: row.id, nomor_spj: row.nomor_spj, nomor_spm, status: row.status },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Gagal menerbitkan SPM", error: err.message });
  }
});

export default router;
