// =====================================================
// ROUTES: BdsKbj
// Base Path: /api/bds-kbj
// Generated: 2026-03-19T23:39:36.493Z
// =====================================================

import express from 'express';
import {
  getAllBdsKbj,
  getBdsKbjById,
  createBdsKbj,
  updateBdsKbj,
  deleteBdsKbj
} from '../controllers/BDS-KBJ.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllBdsKbj)
  .post(createBdsKbj);

router.route('/:id')
  .get(getBdsKbjById)
  .put(updateBdsKbj)
  .delete(deleteBdsKbj);

export default router;
