// =====================================================
// ROUTES: SekAdm
// Base Path: /api/sek-adm
// Generated: 2026-03-19T23:39:36.635Z
// =====================================================

import express from 'express';
import {
  getAllSekAdm,
  getSekAdmById,
  createSekAdm,
  updateSekAdm,
  deleteSekAdm
} from '../controllers/SEK-ADM.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllSekAdm)
  .post(createSekAdm);

router.route('/:id')
  .get(getSekAdmById)
  .put(updateSekAdm)
  .delete(deleteSekAdm);

export default router;
