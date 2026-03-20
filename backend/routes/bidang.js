// =====================================================
// ROUTES: Bidang
// Base Path: /api/bidang
// Generated: 2026-03-19T23:39:36.504Z
// =====================================================

import express from 'express';
import {
  getAllBidang,
  getBidangById,
  createBidang,
  updateBidang,
  deleteBidang
} from '../controllers/bidang.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllBidang)
  .post(createBidang);

router.route('/:id')
  .get(getBidangById)
  .put(updateBidang)
  .delete(deleteBidang);

export default router;
