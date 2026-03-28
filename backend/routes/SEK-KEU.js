// =====================================================
// ROUTES: SekKeu
// Base Path: /api/sek-keu
// Generated: 2026-03-19T23:39:36.718Z
// =====================================================

import express from "express";
import {
  getAllSekKeu,
  getSekKeuById,
  createSekKeu,
  updateSekKeu,
  deleteSekKeu,
} from "../controllers/SEK-KEU.js";
import { protect } from "../middleware/auth.js";
import { requirePermission } from "../middleware/permissionCheck.js";
import { maskFields } from "../middleware/fieldMask.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(
    requirePermission("sek-keu", "read"),
    maskFields("sek-keu"),
    getAllSekKeu,
  )
  .post(requirePermission("sek-keu", "create"), createSekKeu);

router
  .route("/:id")
  .get(
    requirePermission("sek-keu", "read"),
    maskFields("sek-keu"),
    getSekKeuById,
  )
  .put(requirePermission("sek-keu", "update"), updateSekKeu)
  .delete(requirePermission("sek-keu", "delete"), deleteSekKeu);

export default router;
