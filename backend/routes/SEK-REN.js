// =====================================================
// ROUTES: SekRen
// Base Path: /api/sek-ren
// Generated: 2026-03-19T23:39:36.923Z
// =====================================================

import express from 'express';
import {
  getAllSekRen,
  getSekRenById,
  createSekRen,
  updateSekRen,
  deleteSekRen
} from '../controllers/SEK-REN.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllSekRen)
  .post(createSekRen);

router.route('/:id')
  .get(getSekRenById)
  .put(updateSekRen)
  .delete(deleteSekRen);

export default router;
