// =====================================================
// ROUTES: SekLds
// Base Path: /api/sek-lds
// Generated: 2026-03-19T23:39:36.740Z
// =====================================================

import express from 'express';
import {
  getAllSekLds,
  getSekLdsById,
  createSekLds,
  updateSekLds,
  deleteSekLds
} from '../controllers/SEK-LDS.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllSekLds)
  .post(createSekLds);

router.route('/:id')
  .get(getSekLdsById)
  .put(updateSekLds)
  .delete(deleteSekLds);

export default router;
