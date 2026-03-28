// backend/routes/pelaksana/tugasRoutes.js
// Routes Tugas Saya — BAGIAN H API design

import express from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import {
  getTugasSaya,
  terimaTugas, 
  mulaiTugas,
  submitTugas,
  revisiTugas,
  getChecklist,
  createChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem
} from '../../controllers/pelaksana/tugasSayaController.js';
import { 
  pelaksanaRoleGuard, 
  tugasSayaGuard, 
  submitTugasGuard 
} from '../../middleware/pelaksanaRoleGuard.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

// File upload untuk bukti kerja
const UPLOAD_TASKS_DIR = path.join(process.cwd(), 'uploads', 'tasks');
fs.mkdirSync(UPLOAD_TASKS_DIR, { recursive: true });

const buktiStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_TASKS_DIR),
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const buktiUpload = multer({ 
  storage: buktiStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|xlsx|docx|doc/;
    allowedTypes.test(file.mimetype) 
      ? cb(null, true) 
      : cb(new Error('File type tidak diizinkan'), false);
  }
});

router.use(protect, pelaksanaRoleGuard);

// ── LIST TUGAS SAYA ──
router.get('/', tugasSayaGuard, getTugasSaya);

// ── STATE TRANSITIONS ──
router.post('/:id/terima', terimaTugas);
router.post('/:id/mulai', mulaiTugas);
router.post('/:id/submit', submitTugasGuard, buktiUpload.array('bukti_files', 5), submitTugas);
router.post('/:id/revisi', submitTugasGuard, buktiUpload.array('bukti_files', 5), revisiTugas);

// ── SUB-CHECKLIST (alat bantu pribadi Pelaksana) ──
router.get('/:id/checklist', getChecklist);
router.post('/:id/checklist', createChecklistItem);
router.put('/:id/checklist/:itemId', toggleChecklistItem);
router.delete('/:id/checklist/:itemId', deleteChecklistItem);

export default router;

