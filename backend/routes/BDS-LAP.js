// =====================================================
// ROUTES: BdsLap
// Base Path: /api/bds-lap
// Generated: 2026-03-19T23:39:36.496Z
// =====================================================

import express from 'express';
import {
  getAllBdsLap,
  getBdsLapById,
  createBdsLap,
  updateBdsLap,
  deleteBdsLap
} from '../controllers/BDS-LAP.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllBdsLap)
  .post(createBdsLap);

router.route('/:id')
  .get(getBdsLapById)
  .put(updateBdsLap)
  .delete(deleteBdsLap);

export default router;
