// =====================================================
// ROUTES: SekRen
// Base Path: /api/sek-ren
// Generated: 2026-02-17T19:24:49.309Z
// =====================================================

import express from "express";
import {
  getAllSekRen,
  getSekRenById,
  createSekRen,
  updateSekRen,
  deleteSekRen,
} from "../controllers/SEK-REN.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.route("/").get(getAllSekRen).post(createSekRen);

router.route("/:id").get(getSekRenById).put(updateSekRen).delete(deleteSekRen);

export default router;
