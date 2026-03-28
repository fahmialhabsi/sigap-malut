// =====================================================
// ROUTES: Stok
// Base Path: /api/stok
// Generated: 2026-03-19T23:39:36.937Z
// =====================================================

import express from "express";
import {
  getAllStok,
  getStokById,
  createStok,
  updateStok,
  deleteStok,
} from "../controllers/stok.js";
import { protect } from "../middleware/auth.js";
import { requirePermission } from "../middleware/permissionCheck.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(requirePermission("stok", "read"), getAllStok)
  .post(requirePermission("stok", "create"), createStok);

router
  .route("/:id")
  .get(requirePermission("stok", "read"), getStokById)
  .put(requirePermission("stok", "update"), updateStok)
  .delete(requirePermission("stok", "delete"), deleteStok);

export default router;
