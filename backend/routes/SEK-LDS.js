// =====================================================
// ROUTES: SekLds
// Base Path: /api/sek-lds
// Generated: 2026-02-17T19:24:49.307Z
// =====================================================

import express from "express";
import {
  getAllSekLds,
  getSekLdsById,
  createSekLds,
  updateSekLds,
  deleteSekLds,
} from "../controllers/SEK-LDS.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.route("/").get(getAllSekLds).post(createSekLds);

router.route("/:id").get(getSekLdsById).put(updateSekLds).delete(deleteSekLds);

export default router;
