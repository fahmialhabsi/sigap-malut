// =====================================================
// ROUTES: BksKmn
// Base Path: /api/bks-kmn
// Generated: 2026-03-19T23:39:36.517Z
// =====================================================

import express from 'express';
import {
  getAllBksKmn,
  getBksKmnById,
  createBksKmn,
  updateBksKmn,
  deleteBksKmn
} from '../controllers/BKS-KMN.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllBksKmn)
  .post(createBksKmn);

router.route('/:id')
  .get(getBksKmnById)
  .put(updateBksKmn)
  .delete(deleteBksKmn);

export default router;
