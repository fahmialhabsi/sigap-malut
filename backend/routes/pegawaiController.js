// =====================================================
// ROUTES: Pegawaicontroller
// Base Path: /api/pegawaicontroller
// Generated: 2026-03-19T23:39:36.621Z
// =====================================================

import express from "express";
import {
  listPegawai,
  searchPegawai,
  getPegawaiById,
} from "../controllers/pegawaiController.js";
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.get("/", listPegawai);
router.get("/search", searchPegawai);
router.get("/:id", getPegawaiById);

export default router;
