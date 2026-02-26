// =====================================================
// ROUTES: SekKeu
// Base Path: /api/sek-keu
// Generated: 2026-02-17T19:24:49.306Z
// =====================================================

import express from "express";
import {
  getAllSekKeu,
  getSekKeuById,
  createSekKeu,
  updateSekKeu,
  deleteSekKeu,
} from "../controllers/SEK-KEU.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.route("/").get(getAllSekKeu).post(createSekKeu);

router.route("/:id").get(getSekKeuById).put(updateSekKeu).delete(deleteSekKeu);

export default router;
