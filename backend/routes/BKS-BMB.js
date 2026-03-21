// =====================================================
// ROUTES: BksBmb
// Base Path: /api/bks-bmb
// Generated: 2026-03-19T23:39:36.506Z
// =====================================================

import express from 'express';
import {
  getAllBksBmb,
  getBksBmbById,
  createBksBmb,
  updateBksBmb,
  deleteBksBmb
} from '../controllers/BKS-BMB.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllBksBmb)
  .post(createBksBmb);

router.route('/:id')
  .get(getBksBmbById)
  .put(updateBksBmb)
  .delete(deleteBksBmb);

export default router;
