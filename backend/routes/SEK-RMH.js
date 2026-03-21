// =====================================================
// ROUTES: SekRmh
// Base Path: /api/sek-rmh
// Generated: 2026-03-19T23:39:36.935Z
// =====================================================

import express from 'express';
import {
  getAllSekRmh,
  getSekRmhById,
  createSekRmh,
  updateSekRmh,
  deleteSekRmh
} from '../controllers/SEK-RMH.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllSekRmh)
  .post(createSekRmh);

router.route('/:id')
  .get(getSekRmhById)
  .put(updateSekRmh)
  .delete(deleteSekRmh);

export default router;
