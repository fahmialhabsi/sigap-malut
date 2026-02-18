// =====================================================
// ROUTES: SekRmh
// Base Path: /api/sek-rmh
// Generated: 2026-02-17T19:24:49.311Z
// =====================================================

import express from "express";
import {
  getAllSekRmh,
  getSekRmhById,
  createSekRmh,
  updateSekRmh,
  deleteSekRmh,
} from "../controllers/SEK-RMH.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.route("/").get(getAllSekRmh).post(createSekRmh);

router.route("/:id").get(getSekRmhById).put(updateSekRmh).delete(deleteSekRmh);

export default router;
