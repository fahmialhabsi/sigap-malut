// =====================================================
// ROUTES: SekHum
// Base Path: /api/sek-hum
// Generated: 2026-02-17T19:24:49.304Z
// =====================================================

import express from "express";
import {
  getAllSekHum,
  getSekHumById,
  createSekHum,
  updateSekHum,
  deleteSekHum,
} from "../controllers/SEK-HUM.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.route("/").get(getAllSekHum).post(createSekHum);

router.route("/:id").get(getSekHumById).put(updateSekHum).delete(deleteSekHum);

export default router;
