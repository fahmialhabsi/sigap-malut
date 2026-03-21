// =====================================================
// ROUTES: Kgb
// Base Path: /api/kgb
// Generated: 2026-03-19T23:39:36.592Z
// =====================================================

import express from 'express';
import {
  getAllKgb,
  getKgbById,
  createKgb,
  updateKgb,
  deleteKgb
} from '../controllers/kgb.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllKgb)
  .post(createKgb);

router.route('/:id')
  .get(getKgbById)
  .put(updateKgb)
  .delete(deleteKgb);

export default router;
