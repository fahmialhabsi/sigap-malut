// =====================================================
// ROUTES: Komoditascontroller
// Base Path: /api/komoditascontroller
// Generated: 2026-03-19T23:39:36.602Z
// =====================================================

import express from "express";
import {
  listKomoditas,
  searchKomoditas,
  getKomoditasById,
} from "../controllers/komoditasController.js";
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.get("/", listKomoditas);
router.get("/search", searchKomoditas);
router.get("/:id", getKomoditasById);

export default router;
