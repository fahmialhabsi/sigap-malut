// =====================================================
// ROUTES: Modulegeneratorcontroller
// Base Path: /api/modulegeneratorcontroller
// Generated: 2026-03-19T23:39:36.616Z
// =====================================================

import express from "express";
import {
  moduleGenerate,
  listDynamicModules,
} from "../controllers/moduleGeneratorController.js";
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route("/").get(listDynamicModules).post(moduleGenerate);

export default router;
