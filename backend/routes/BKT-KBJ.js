// =====================================================
// ROUTES: BktKbj
// Base Path: /api/bkt-kbj
// Generated: 2026-03-19T23:39:36.535Z
// =====================================================

import express from 'express';
import {
  getAllBktKbj,
  getBktKbjById,
  createBktKbj,
  updateBktKbj,
  deleteBktKbj
} from '../controllers/BKT-KBJ.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllBktKbj)
  .post(createBktKbj);

router.route('/:id')
  .get(getBktKbjById)
  .put(updateBktKbj)
  .delete(deleteBktKbj);

export default router;
