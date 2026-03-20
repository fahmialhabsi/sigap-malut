// =====================================================
// ROUTES: BktPgd
// Base Path: /api/bkt-pgd
// Generated: 2026-03-19T23:39:36.559Z
// =====================================================

import express from 'express';
import {
  getAllBktPgd,
  getBktPgdById,
  createBktPgd,
  updateBktPgd,
  deleteBktPgd
} from '../controllers/BKT-PGD.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllBktPgd)
  .post(createBktPgd);

router.route('/:id')
  .get(getBktPgdById)
  .put(updateBktPgd)
  .delete(deleteBktPgd);

export default router;
