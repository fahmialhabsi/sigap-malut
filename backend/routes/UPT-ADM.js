// =====================================================
// ROUTES: UptAdm
// Base Path: /api/upt-adm
// Generated: 2026-02-17T19:24:49.312Z
// =====================================================

import express from "express";
import {
  getAllUptAdm,
  getUptAdmById,
  createUptAdm,
  updateUptAdm,
  deleteUptAdm,
} from "../controllers/UPT-ADM.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.route("/").get(getAllUptAdm).post(createUptAdm);

router.route("/:id").get(getUptAdmById).put(updateUptAdm).delete(deleteUptAdm);

export default router;
