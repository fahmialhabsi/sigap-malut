// =====================================================
// ROUTES: BdsCpd
// Base Path: /api/bds-cpd
// Generated: 2026-03-19T23:39:36.476Z
// =====================================================

import express from 'express';
import {
  getAllBdsCpd,
  getBdsCpdById,
  createBdsCpd,
  updateBdsCpd,
  deleteBdsCpd
} from '../controllers/BDS-CPD.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllBdsCpd)
  .post(createBdsCpd);

router.route('/:id')
  .get(getBdsCpdById)
  .put(updateBdsCpd)
  .delete(deleteBdsCpd);

export default router;
