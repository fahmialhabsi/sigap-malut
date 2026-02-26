// =====================================================
// ROUTES: SekAdm
// Base Path: /api/sek-adm
// Generated: 2026-02-17T19:24:49.303Z
// =====================================================

import express from "express";
import {
  getAllSekAdm,
  getSekAdmById,
  createSekAdm,
  updateSekAdm,
  deleteSekAdm,
} from "../controllers/SEK-ADM.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.route("/").get(getAllSekAdm).post(createSekAdm);

router.route("/:id").get(getSekAdmById).put(updateSekAdm).delete(deleteSekAdm);

export default router;
