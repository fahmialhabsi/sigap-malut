// =====================================================
// ROUTES: Komoditas
// Base Path: /api/komoditas
// Generated: 2026-03-19T23:39:36.598Z
// =====================================================

import express from 'express';
import {
  getAllKomoditas,
  getKomoditasById,
  createKomoditas,
  updateKomoditas,
  deleteKomoditas
} from '../controllers/komoditas.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllKomoditas)
  .post(createKomoditas);

router.route('/:id')
  .get(getKomoditasById)
  .put(updateKomoditas)
  .delete(deleteKomoditas);

export default router;
