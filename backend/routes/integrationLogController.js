// =====================================================
// ROUTES: Integrationlogcontroller
// Base Path: /api/integrationlogcontroller
// Generated: 2026-03-19T23:39:36.588Z
// =====================================================

import express from "express";
import { getIntegrationLogs } from "../controllers/integrationLogController.js";
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.get("/", getIntegrationLogs);

export default router;
