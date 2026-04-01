// Routes: JF Bidang Konsumsi & Keamanan Pangan
import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { confidentialSkpGuard } from "../middleware/confidentialSkpGuard.js";
import {
  getTugasKabid,
  terimaTugasKabid,
  submitHasilKeKabid,
  getVerifikasiQueue,
  terimaVerifikasi,
  kembalikanVerifikasi,
  getTimPelaksana,
  assignTugasKePelaksana,
  getSkpPelaksana,
  inputSkpPelaksana,
  getAnalisaList,
  buatAnalisa,
  submitAnalisaKeKabid,
  createKoordinasiUptd,
  getKoordinasiUptdStatus,
} from "../controllers/jfKonsumsiController.js";

const router = Router();

router.use(protect);

// Tugas dari Kepala Bidang
router.get("/tugas-kabid", getTugasKabid);
router.post("/tugas-kabid/:id/terima", terimaTugasKabid);
router.post("/tugas-kabid/:id/submit", submitHasilKeKabid);

// Verifikasi data dari Pelaksana (3 sub-type: survei / sppg / inspeksi)
router.get("/verifikasi/masuk", getVerifikasiQueue);
router.post("/verifikasi/:id/ok", terimaVerifikasi);
router.post("/verifikasi/:id/kembalikan", kembalikanVerifikasi);

// Analisa
router.get("/analisa", getAnalisaList);
router.post("/analisa", buatAnalisa);
router.post("/analisa/:id/submit-kabid", submitAnalisaKeKabid);

// Koordinasi UPTD
router.post("/koordinasi-uptd", createKoordinasiUptd);
router.get("/koordinasi-uptd/status", getKoordinasiUptdStatus);

// Manajemen Tim Pelaksana
router.get("/tim", getTimPelaksana);
router.post("/tim/tugas", assignTugasKePelaksana);

// SKP Pelaksana (CONFIDENTIAL — hanya JF penilai langsung)
router.get("/skp/pelaksana", confidentialSkpGuard, getSkpPelaksana);
router.post("/skp/pelaksana/:pelaksanaId", confidentialSkpGuard, inputSkpPelaksana);

export default router;

