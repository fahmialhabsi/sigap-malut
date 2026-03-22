import express from "express";
import multer from "multer";
import { protect } from "../middleware/auth.js";
import limiter from "../middleware/rateLimiter.js";
import {
  uploadSuratMasuk,
  getAllSuratMasuk,
  getSuratMasukById,
  konfirmasiSuratMasuk,
  buatDisposisi,
  selesaikanDisposisi,
  getDisposisiSaya,
} from "../controllers/suratMasukController.js";
import {
  createSuratKeluar,
  getAllSuratKeluar,
  getSuratKeluarById,
  updateSuratKeluar,
  submitSuratKeluar,
  approveSuratKeluar,
  getDashboardStatsSurat,
} from "../controllers/suratKeluarController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/surat/" });

// Apply rate limiting to all surat endpoints
router.use(limiter);

// Surat Masuk
router.post("/masuk/upload", protect, upload.single("file_surat"), uploadSuratMasuk);
router.get("/masuk", protect, getAllSuratMasuk);
router.get("/masuk/:id", protect, getSuratMasukById);
router.put("/masuk/:id/konfirmasi", protect, konfirmasiSuratMasuk);
router.post("/masuk/disposisi", protect, buatDisposisi);
router.put("/disposisi/:id/selesai", protect, upload.array("file_balasan", 5), selesaikanDisposisi);
router.get("/disposisi/saya", protect, getDisposisiSaya);

// Surat Keluar
router.post("/keluar", protect, upload.single("file_draft"), createSuratKeluar);
router.get("/keluar", protect, getAllSuratKeluar);
router.get("/keluar/:id", protect, getSuratKeluarById);
router.put("/keluar/:id", protect, updateSuratKeluar);
router.put("/keluar/:id/submit", protect, submitSuratKeluar);
router.put("/keluar/:id/approve", protect, approveSuratKeluar);

// Stats
router.get("/dashboard/stats", protect, getDashboardStatsSurat);

export default router;
