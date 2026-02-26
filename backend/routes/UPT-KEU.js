// =====================================================
// ROUTES: UptKeu
// Base Path: /api/upt-keu
// Generated: 2026-02-17T19:24:49.315Z
// =====================================================

import express from "express";
import {
  getAllUptKeu,
  getUptKeuById,
  createUptKeu,
  updateUptKeu,
  deleteUptKeu,
} from "../controllers/UPT-KEU.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.route("/").get(getAllUptKeu).post(createUptKeu);

router.route("/:id").get(getUptKeuById).put(updateUptKeu).delete(deleteUptKeu);

export default router;
