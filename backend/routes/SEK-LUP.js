// =====================================================
// ROUTES: SekLup
// Base Path: /api/sek-lup
// Generated: 2026-03-19T23:39:36.866Z
// =====================================================

import express from 'express';
import {
  getAllSekLup,
  getSekLupById,
  createSekLup,
  updateSekLup,
  deleteSekLup
} from '../controllers/SEK-LUP.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllSekLup)
  .post(createSekLup);

router.route('/:id')
  .get(getSekLupById)
  .put(updateSekLup)
  .delete(deleteSekLup);

export default router;
