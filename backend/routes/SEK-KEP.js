// =====================================================
// ROUTES: SekKep
// Base Path: /api/sek-kep
// Generated: 2026-03-19T23:39:36.712Z
// =====================================================

import express from 'express';
import {
  getAllSekKep,
  getSekKepById,
  createSekKep,
  updateSekKep,
  deleteSekKep
} from '../controllers/SEK-KEP.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllSekKep)
  .post(createSekKep);

router.route('/:id')
  .get(getSekKepById)
  .put(updateSekKep)
  .delete(deleteSekKep);

export default router;
