// =====================================================
// ROUTES: Layanan
// Base Path: /api/layanan
// Generated: 2026-03-19T23:39:36.607Z
// =====================================================

import express from 'express';
import {
  getAllLayanan,
  getLayananById,
  createLayanan,
  updateLayanan,
  deleteLayanan
} from '../controllers/layanan.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllLayanan)
  .post(createLayanan);

router.route('/:id')
  .get(getLayananById)
  .put(updateLayanan)
  .delete(deleteLayanan);

export default router;
