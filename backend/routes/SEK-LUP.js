// =====================================================
// ROUTES: SekLup
// Base Path: /api/sek-lup
// Generated: 2026-02-17T19:24:49.309Z
// =====================================================

import express from "express";
import {
  getAllSekLup,
  getSekLupById,
  createSekLup,
  updateSekLup,
  deleteSekLup,
} from "../controllers/SEK-LUP.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.route("/").get(getAllSekLup).post(createSekLup);

router.route("/:id").get(getSekLupById).put(updateSekLup).delete(deleteSekLup);

export default router;
