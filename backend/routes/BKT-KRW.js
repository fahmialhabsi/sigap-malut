// =====================================================
// ROUTES: BktKrw
// Base Path: /api/bkt-krw
// Generated: 2026-03-19T23:39:36.539Z
// =====================================================

import express from 'express';
import {
  getAllBktKrw,
  getBktKrwById,
  createBktKrw,
  updateBktKrw,
  deleteBktKrw
} from '../controllers/BKT-KRW.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllBktKrw)
  .post(createBktKrw);

router.route('/:id')
  .get(getBktKrwById)
  .put(updateBktKrw)
  .delete(deleteBktKrw);

export default router;
