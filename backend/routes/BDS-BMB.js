// =====================================================
// ROUTES: BdsBmb
// Base Path: /api/bds-bmb
// Generated: 2026-03-19T23:39:36.472Z
// =====================================================

import express from 'express';
import {
  getAllBdsBmb,
  getBdsBmbById,
  createBdsBmb,
  updateBdsBmb,
  deleteBdsBmb
} from '../controllers/BDS-BMB.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllBdsBmb)
  .post(createBdsBmb);

router.route('/:id')
  .get(getBdsBmbById)
  .put(updateBdsBmb)
  .delete(deleteBdsBmb);

export default router;
