// =====================================================
// ROUTES: BdsLap
// Base Path: /api/bds-lap
// Generated: 2026-03-19T23:39:36.496Z
// =====================================================

import express from 'express';
import {
  getAllBdsLap,
  getBdsLapById,
  getBdsLapFinalisasiPreview,
  getBdsLapLockStatus,
  createBdsLap,
  updateBdsLap,
  lockBdsLapToEPelara,
  deleteBdsLap
} from '../controllers/BDS-LAP.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllBdsLap)
  .post(createBdsLap);

router.get('/finalisasi/preview', getBdsLapFinalisasiPreview);
router.get('/:id/finalisasi-status', getBdsLapLockStatus);
router.post('/:id/kunci-ke-epelara', lockBdsLapToEPelara);

router.route('/:id')
  .get(getBdsLapById)
  .put(updateBdsLap)
  .delete(deleteBdsLap);

export default router;
