// =====================================================
// ROUTES: BksDvr
// Base Path: /api/bks-dvr
// Generated: 2026-03-19T23:39:36.508Z
// =====================================================

import express from 'express';
import {
  getAllBksDvr,
  getBksDvrById,
  createBksDvr,
  updateBksDvr,
  deleteBksDvr
} from '../controllers/BKS-DVR.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllBksDvr)
  .post(createBksDvr);

router.route('/:id')
  .get(getBksDvrById)
  .put(updateBksDvr)
  .delete(deleteBksDvr);

export default router;
