// =====================================================
// ROUTES: BdsMon
// Base Path: /api/bds-mon
// Generated: 2026-03-19T23:39:36.500Z
// =====================================================

import express from 'express';
import {
  getAllBdsMon,
  getBdsMonById,
  createBdsMon,
  updateBdsMon,
  deleteBdsMon
} from '../controllers/BDS-MON.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllBdsMon)
  .post(createBdsMon);

router.route('/:id')
  .get(getBdsMonById)
  .put(updateBdsMon)
  .delete(deleteBdsMon);

export default router;
