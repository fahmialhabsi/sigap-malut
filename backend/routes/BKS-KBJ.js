// =====================================================
// ROUTES: BksKbj
// Base Path: /api/bks-kbj
// Generated: 2026-03-19T23:39:36.513Z
// =====================================================

import express from 'express';
import {
  getAllBksKbj,
  getBksKbjById,
  createBksKbj,
  updateBksKbj,
  deleteBksKbj
} from '../controllers/BKS-KBJ.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllBksKbj)
  .post(createBksKbj);

router.route('/:id')
  .get(getBksKbjById)
  .put(updateBksKbj)
  .delete(deleteBksKbj);

export default router;
