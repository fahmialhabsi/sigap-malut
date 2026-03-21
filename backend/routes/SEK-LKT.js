// =====================================================
// ROUTES: SekLkt
// Base Path: /api/sek-lkt
// Generated: 2026-03-19T23:39:36.829Z
// =====================================================

import express from 'express';
import {
  getAllSekLkt,
  getSekLktById,
  createSekLkt,
  updateSekLkt,
  deleteSekLkt
} from '../controllers/SEK-LKT.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllSekLkt)
  .post(createSekLkt);

router.route('/:id')
  .get(getSekLktById)
  .put(updateSekLkt)
  .delete(deleteSekLkt);

export default router;
