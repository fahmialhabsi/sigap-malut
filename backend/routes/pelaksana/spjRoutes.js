// backend/routes/pelaksana/spjRoutes.js
// SPJ routes Pelaksana — BAGIAN H API + spjSelfGuard KRITIS!

import express from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import {
  getSpjSaya,
  buatSpj,
  updateSpjDraft,
  submitSpj,
  perbaikiSpj,
  exportSpj
} from '../../controllers/pelaksana/spjController.js';
import { 
  pelaksanaRoleGuard, 
  spjSelfGuard  // KRITIS!
} from '../../middleware/pelaksanaRoleGuard.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

// Multer untuk lampiran SPJ (SPPD, kwitansi, dll)
const SPJ_UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'spj');
fs.mkdirSync(SPJ_UPLOAD_DIR, { recursive: true });

const lampiranStorage = multer.diskStorage({
  destination: SPJ_UPLOAD_DIR,
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${path.extname(file.originalname)}`;
    cb(null, unique);
  }
});

const lampiranUpload = multer({ 
  storage: lampiranStorage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB SPJ docs
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('PDF/gambar only'), false);
  }
});

router.use(protect, pelaksanaRoleGuard);

// ── LIST SPJ SAYA ──
router.get('/', getSpjSaya);

// ── CREATE SPJ BARU ──
router.post('/', spjSelfGuard, lampiranUpload.fields([
  { name: 'lampiran_sppd', maxCount: 1 },
  { name: 'lampiran_tiket', maxCount: 3 },
  { name: 'lampiran_kwitansi', maxCount: 5 },
  { name: 'lampiran_laporan', maxCount: 1 }
]), buatSpj);

// ── UPDATE DRAFT ──
router.put('/:id', spjSelfGuard, lampiranUpload.fields([
  { name: 'lampiran_sppd', maxCount: 1 },
  { name: 'lampiran_tiket', maxCount: 3 },
  { name: 'lampiran_kwitansi', maxCount: 5 }
]), updateSpjDraft);

// ── SUBMIT KE BENDAHARA ──
router.post('/:id/submit', spjSelfGuard, submitSpj);

// ── PERBAIKI SETELAH DIKEMBALIKAN ──
router.post('/:id/perbaiki', spjSelfGuard, lampiranUpload.fields([
  { name: 'lampiran_perbaikan', maxCount: 5 }
]), perbaikiSpj);

// ── DOWNLOAD PDF SPJ DISETUJUI ──
router.get('/:id/export', exportSpj);

export default router;

