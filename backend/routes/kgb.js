// =====================================================
// ROUTES: Kgb
// Base Path: /api/kgb
// Generated: 2026-03-19T23:39:36.592Z
// =====================================================

import express from "express";
import {
  getAllKgb,
  getKgbById,
  createKgb,
  updateKgb,
  deleteKgb,
} from "../controllers/kgb.js";
import { protect } from "../middleware/auth.js";
import { requirePermission } from "../middleware/permissionCheck.js";
import { maskFields } from "../middleware/fieldMask.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(requirePermission("kgb", "read"), maskFields("kgb"), getAllKgb)
  .post(requirePermission("kgb", "create"), createKgb);

router
  .route("/:id")
  .get(requirePermission("kgb", "read"), maskFields("kgb"), getKgbById)
  .put(requirePermission("kgb", "update"), updateKgb)
  .delete(requirePermission("kgb", "delete"), deleteKgb);

export default router;
