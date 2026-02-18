// =====================================================
// ROUTES: UptKep
// Base Path: /api/upt-kep
// Generated: 2026-02-17T19:24:49.315Z
// =====================================================

import express from "express";
import {
  getAllUptKep,
  getUptKepById,
  createUptKep,
  updateUptKep,
  deleteUptKep,
} from "../controllers/UPT-KEP.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.route("/").get(getAllUptKep).post(createUptKep);

router.route("/:id").get(getUptKepById).put(updateUptKep).delete(deleteUptKep);

export default router;
