// =====================================================
// ROUTES: Dataintegrationlog
// Base Path: /api/dataintegrationlog
// Generated: 2026-03-19T23:39:36.570Z
// =====================================================

import express from 'express';
import {
  getAllDataintegrationlog,
  getDataintegrationlogById,
  createDataintegrationlog,
  updateDataintegrationlog,
  deleteDataintegrationlog
} from '../controllers/dataIntegrationLog.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllDataintegrationlog)
  .post(createDataintegrationlog);

router.route('/:id')
  .get(getDataintegrationlogById)
  .put(updateDataintegrationlog)
  .delete(deleteDataintegrationlog);

export default router;
