// =====================================================
// ROUTES: SekLks
// Base Path: /api/sek-lks
// Generated: 2026-02-17T19:24:49.308Z
// =====================================================

import express from "express";
import {
  getAllSekLks,
  getSekLksById,
  createSekLks,
  updateSekLks,
  deleteSekLks,
} from "../controllers/SEK-LKS.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.route("/").get(getAllSekLks).post(createSekLks);

router.route("/:id").get(getSekLksById).put(updateSekLks).delete(deleteSekLks);

export default router;
