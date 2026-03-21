// =====================================================
// ROUTES: BdsEvl
// Base Path: /api/bds-evl
// Generated: 2026-03-19T23:39:36.479Z
// =====================================================

import express from 'express';
import {
  getAllBdsEvl,
  getBdsEvlById,
  createBdsEvl,
  updateBdsEvl,
  deleteBdsEvl
} from '../controllers/BDS-EVL.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllBdsEvl)
  .post(createBdsEvl);

router.route('/:id')
  .get(getBdsEvlById)
  .put(updateBdsEvl)
  .delete(deleteBdsEvl);

export default router;
