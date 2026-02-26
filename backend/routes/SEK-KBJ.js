// =====================================================
// ROUTES: SekKbj
// Base Path: /api/sek-kbj
// Generated: 2026-02-17T19:24:49.305Z
// =====================================================

import express from "express";
import {
  getAllSekKbj,
  getSekKbjById,
  createSekKbj,
  updateSekKbj,
  deleteSekKbj,
} from "../controllers/SEK-KBJ.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.route("/").get(getAllSekKbj).post(createSekKbj);

router.route("/:id").get(getSekKbjById).put(updateSekKbj).delete(deleteSekKbj);

export default router;
