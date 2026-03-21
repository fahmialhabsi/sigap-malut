// =====================================================
// ROUTES: BktBmb
// Base Path: /api/bkt-bmb
// Generated: 2026-03-19T23:39:36.523Z
// =====================================================

import express from 'express';
import {
  getAllBktBmb,
  getBktBmbById,
  createBktBmb,
  updateBktBmb,
  deleteBktBmb
} from '../controllers/BKT-BMB.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllBktBmb)
  .post(createBktBmb);

router.route('/:id')
  .get(getBktBmbById)
  .put(updateBktBmb)
  .delete(deleteBktBmb);

export default router;
