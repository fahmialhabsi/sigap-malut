// =====================================================
// ROUTES: BdsHrg
// Base Path: /api/bds-hrg
// Generated: 2026-03-19T23:39:36.486Z
// =====================================================

import express from 'express';
import {
  getAllBdsHrg,
  getBdsHrgById,
  createBdsHrg,
  updateBdsHrg,
  deleteBdsHrg
} from '../controllers/BDS-HRG.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllBdsHrg)
  .post(createBdsHrg);

router.route('/:id')
  .get(getBdsHrgById)
  .put(updateBdsHrg)
  .delete(deleteBdsHrg);

export default router;
