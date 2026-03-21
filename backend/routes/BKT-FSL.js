// =====================================================
// ROUTES: BktFsl
// Base Path: /api/bkt-fsl
// Generated: 2026-03-19T23:39:36.526Z
// =====================================================

import express from 'express';
import {
  getAllBktFsl,
  getBktFslById,
  createBktFsl,
  updateBktFsl,
  deleteBktFsl
} from '../controllers/BKT-FSL.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllBktFsl)
  .post(createBktFsl);

router.route('/:id')
  .get(getBktFslById)
  .put(updateBktFsl)
  .delete(deleteBktFsl);

export default router;
