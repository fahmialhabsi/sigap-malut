// =====================================================
// ROUTES: BktMev
// Base Path: /api/bkt-mev
// Generated: 2026-03-19T23:39:36.551Z
// =====================================================

import express from 'express';
import {
  getAllBktMev,
  getBktMevById,
  createBktMev,
  updateBktMev,
  deleteBktMev
} from '../controllers/BKT-MEV.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllBktMev)
  .post(createBktMev);

router.route('/:id')
  .get(getBktMevById)
  .put(updateBktMev)
  .delete(deleteBktMev);

export default router;
