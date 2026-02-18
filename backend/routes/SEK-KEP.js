// =====================================================
// ROUTES: SekKep
// Base Path: /api/sek-kep
// Generated: 2026-02-17T19:24:49.305Z
// =====================================================

import express from "express";
import {
  getAllSekKep,
  getSekKepById,
  createSekKep,
  updateSekKep,
  deleteSekKep,
} from "../controllers/SEK-KEP.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.route("/").get(getAllSekKep).post(createSekKep);

router.route("/:id").get(getSekKepById).put(updateSekKep).delete(deleteSekKep);

export default router;
