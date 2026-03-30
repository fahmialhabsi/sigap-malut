// Routes: JF Bidang Distribusi
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
  getCoverageHariIni,
  postReminderPelaksana,
} from "../controllers/jfDistribusiController.js";

const router = Router();

router.use(protect);

router.get("/tugas-kabid", getTugasKabid);
router.post("/tugas-kabid/:id/terima", terimaTugasKabid);
router.post("/tugas-kabid/:id/submit", submitHasilKeKabid);

router.get("/verifikasi/masuk", getVerifikasiQueue);
router.post("/verifikasi/:id/terima", terimaVerifikasi);
router.post("/verifikasi/:id/kembalikan", kembalikanVerifikasi);

router.get("/harga/verifikasi", getVerifikasiQueue);
router.get("/harga/coverage-hari-ini", getCoverageHariIni);
router.post("/harga/reminder-pelaksana", postReminderPelaksana);

router.get("/tim", getTimPelaksana);
router.post("/tim/tugas", assignTugasKePelaksana);

router.get("/analisa", getAnalisaList);
router.post("/analisa", buatAnalisa);

router.get("/skp/pelaksana", confidentialSkpGuard, getSkpPelaksana);
router.post("/skp/pelaksana/:pelaksanaId", confidentialSkpGuard, inputSkpPelaksana);

export default router;
