// =====================================================
// ROUTES: SekLks
// Base Path: /api/sek-lks
// Generated: 2026-03-19T23:39:36.784Z
// =====================================================

import express from 'express';
import {
  getAllSekLks,
  getSekLksById,
  createSekLks,
  updateSekLks,
  deleteSekLks
} from '../controllers/SEK-LKS.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllSekLks)
  .post(createSekLks);

router.route('/:id')
  .get(getSekLksById)
  .put(updateSekLks)
  .delete(deleteSekLks);

export default router;
