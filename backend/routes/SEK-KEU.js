// =====================================================
// ROUTES: SekKeu
// Base Path: /api/sek-keu
// Generated: 2026-03-19T23:39:36.718Z
// =====================================================

import express from 'express';
import {
  getAllSekKeu,
  getSekKeuById,
  createSekKeu,
  updateSekKeu,
  deleteSekKeu
} from '../controllers/SEK-KEU.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllSekKeu)
  .post(createSekKeu);

router.route('/:id')
  .get(getSekKeuById)
  .put(updateSekKeu)
  .delete(deleteSekKeu);

export default router;
