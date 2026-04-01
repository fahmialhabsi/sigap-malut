// Routes: Kepala Bidang Konsumsi & Keamanan Pangan
import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  requireKabidKonsumsi,
  blockSkpPelaksanaForKabid,
} from "../middleware/kabidKonsumsiGuard.js";
import {
  getDashboardSummary,
  getDualHero,
  getSppgPenerima,
  getSppgRealisasi,
  getSppgAlertDeadline,
  generateLaporanBapanas,
  getPphSummary,
  getInspeksiList,
  getKeracunanList,
  getKeracunanAktif,
  createKoordinasiUptdFromKeracunan,
  listKoordinasiUptd,
  createKoordinasiUptd,
  listHasilUjiUptdMasuk,
  getApprovalQueue,
  setujuiDokumenJF,
  kembalikanDokumenKJF,
  getTimJF,
  assignTugasKeJF,
  getSkpJF,
} from "../controllers/kabidKonsumsiController.js";

const router = Router();

router.use(protect);
router.use(requireKabidKonsumsi);

// === DASHBOARD ===
router.get("/dashboard/summary", getDashboardSummary);
router.get("/dashboard/dual-hero", getDualHero);

// === SPPG & PROGRAM MBG ===
router.get("/sppg/penerima", getSppgPenerima);
router.get("/sppg/realisasi/:bulan/:tahun", getSppgRealisasi);
router.get("/sppg/alert-deadline", getSppgAlertDeadline);
router.post("/sppg/generate-laporan-bapanas", generateLaporanBapanas);

// === PPH & KONSUMSI ===
router.get("/pph/terkini", getPphSummary);

// === KEAMANAN PANGAN ===
router.get("/inspeksi", getInspeksiList);
router.get("/keracunan", getKeracunanList);
router.get("/keracunan/aktif", getKeracunanAktif);
router.post("/keracunan/:id/koordinasi-uptd", createKoordinasiUptdFromKeracunan);

// === KOORDINASI UPTD ===
router.get("/koordinasi-uptd", listKoordinasiUptd);
router.post("/koordinasi-uptd", createKoordinasiUptd);
router.get("/koordinasi-uptd/hasil", listHasilUjiUptdMasuk);

// === MANAJEMEN TIM (reuse pattern) ===
router.get("/tim", getTimJF);
router.post("/tugas", assignTugasKeJF);

// Approval queue dari JF
router.get("/approval-queue", getApprovalQueue);
router.post("/approval-queue/:id/setujui", setujuiDokumenJF);
router.post("/approval-queue/:id/kembalikan", kembalikanDokumenKJF);

// === SKP (CONFIDENTIAL) ===
router.get("/skp/jf", getSkpJF);
router.get("/skp/pelaksana", blockSkpPelaksanaForKabid, (req, res) => {
  res.status(403).json({ error: "forbidden", code: "CONFIDENTIAL_SKP_PELAKSANA" });
});

export default router;

