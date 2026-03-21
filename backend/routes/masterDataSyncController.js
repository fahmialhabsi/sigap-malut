// =====================================================
// ROUTES: Masterdatasynccontroller
// Base Path: /api/masterdatasynccontroller
// Generated: 2026-03-19T23:39:36.615Z
// =====================================================

import express from "express";
import {
  getSyncStats,
  triggerMasterDataSync,
  syncOnce,
} from "../controllers/masterDataSyncController.js";
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.get("/stats", getSyncStats);
router.post("/trigger", triggerMasterDataSync);
router.post("/once", syncOnce);

export default router;
