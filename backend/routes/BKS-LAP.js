// =====================================================
// ROUTES: BksLap
// Base Path: /api/bks-lap
// Generated: 2026-03-19T23:39:36.519Z
// =====================================================

import express from 'express';
import {
  getAllBksLap,
  getBksLapById,
  createBksLap,
  updateBksLap,
  deleteBksLap
} from '../controllers/BKS-LAP.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllBksLap)
  .post(createBksLap);

router.route('/:id')
  .get(getBksLapById)
  .put(updateBksLap)
  .delete(deleteBksLap);

export default router;
