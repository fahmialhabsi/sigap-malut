// =====================================================
// ROUTES: SekKeu
// Base Path: /api/sek-keu
// Generated: 2026-02-17T19:24:49.306Z
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
import { requirePermission } from "../middleware/rbacMiddleware.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router
  .route("/")
  .get(requirePermission("read", { moduleKey: "sek-keu" }), getAllSekKeu)
  .post(requirePermission("create", { moduleKey: "sek-keu" }), createSekKeu);

router
  .route("/:id")
  .get(requirePermission("read", { moduleKey: "sek-keu" }), getSekKeuById)
  .put(requirePermission("update", { moduleKey: "sek-keu" }), updateSekKeu)
  .delete(requirePermission("delete", { moduleKey: "sek-keu" }), deleteSekKeu);

export default router;
