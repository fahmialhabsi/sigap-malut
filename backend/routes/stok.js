// =====================================================
// ROUTES: Stok
// Base Path: /api/stok
// Generated: 2026-03-19T23:39:36.937Z
// =====================================================

import express from 'express';
import {
  getAllStok,
  getStokById,
  createStok,
  updateStok,
  deleteStok
} from '../controllers/stok.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllStok)
  .post(createStok);

router.route('/:id')
  .get(getStokById)
  .put(updateStok)
  .delete(deleteStok);

export default router;
