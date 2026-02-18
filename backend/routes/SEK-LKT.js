// =====================================================
// ROUTES: SekLkt
// Base Path: /api/sek-lkt
// Generated: 2026-02-17T19:24:49.308Z
// =====================================================

import express from "express";
import {
  getAllSekLkt,
  getSekLktById,
  createSekLkt,
  updateSekLkt,
  deleteSekLkt,
} from "../controllers/SEK-LKT.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.route("/").get(getAllSekLkt).post(createSekLkt);

router.route("/:id").get(getSekLktById).put(updateSekLkt).delete(deleteSekLkt);

export default router;
