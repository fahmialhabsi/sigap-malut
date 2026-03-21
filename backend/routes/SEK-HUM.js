// =====================================================
// ROUTES: SekHum
// Base Path: /api/sek-hum
// Generated: 2026-03-19T23:39:36.680Z
// =====================================================

import express from 'express';
import {
  getAllSekHum,
  getSekHumById,
  createSekHum,
  updateSekHum,
  deleteSekHum
} from '../controllers/SEK-HUM.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllSekHum)
  .post(createSekHum);

router.route('/:id')
  .get(getSekHumById)
  .put(updateSekHum)
  .delete(deleteSekHum);

export default router;
