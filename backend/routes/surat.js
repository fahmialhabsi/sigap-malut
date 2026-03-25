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

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
]);

const upload = multer({
  dest: "uploads/surat/",
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        Object.assign(
          new Error(
            "Tipe file tidak diizinkan. Gunakan PDF, JPEG, PNG, atau DOCX.",
          ),
          {
            code: "INVALID_FILE_TYPE",
          },
        ),
        false,
      );
    }
  },
});

// Apply rate limiting to all surat endpoints
router.use(limiter);

// Surat Masuk
router.post(
  "/masuk/upload",
  protect,
  upload.single("file_surat"),
  uploadSuratMasuk,
);
router.get("/masuk", protect, getAllSuratMasuk);
router.get("/masuk/:id", protect, getSuratMasukById);
router.put("/masuk/:id/konfirmasi", protect, konfirmasiSuratMasuk);
router.post("/masuk/disposisi", protect, buatDisposisi);
router.put(
  "/disposisi/:id/selesai",
  protect,
  upload.array("file_balasan", 5),
  selesaikanDisposisi,
);
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

// Multer error handler
router.use((err, _req, res, next) => {
  if (err?.code === "INVALID_FILE_TYPE") {
    return res.status(400).json({ success: false, message: err.message });
  }
  if (err?.code === "LIMIT_FILE_SIZE") {
    return res
      .status(400)
      .json({ success: false, message: "Ukuran file melebihi batas 10 MB." });
  }
  next(err);
});

export default router;
