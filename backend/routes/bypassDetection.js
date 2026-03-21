// =====================================================
// ROUTES: Bypassdetection
// Base Path: /api/bypassdetection
// Generated: 2026-03-19T23:39:36.562Z
// =====================================================

import express from 'express';
import {
  getAllBypassdetection,
  getBypassdetectionById,
  createBypassdetection,
  updateBypassdetection,
  deleteBypassdetection
} from '../controllers/bypassDetection.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllBypassdetection)
  .post(createBypassdetection);

router.route('/:id')
  .get(getBypassdetectionById)
  .put(updateBypassdetection)
  .delete(deleteBypassdetection);

export default router;
