// =====================================================
// ROUTES: BktKbj
// Base Path: /api/bkt-kbj
// Generated: 2026-02-17T19:24:49.300Z
// =====================================================

import express from "express";
import {
  getAllBktKbj,
  getBktKbjById,
  createBktKbj,
  updateBktKbj,
  deleteBktKbj,
} from "../controllers/BKT-KBJ.js";
import { protect } from "../middleware/auth.js";
import { requirePermission } from "../middleware/rbacMiddleware.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router
  .route("/")
  .get(requirePermission("read", { moduleKey: "bkt-kbj" }), getAllBktKbj)
  .post(requirePermission("create", { moduleKey: "bkt-kbj" }), createBktKbj);

router
  .route("/:id")
  .get(requirePermission("read", { moduleKey: "bkt-kbj" }), getBktKbjById)
  .put(requirePermission("update", { moduleKey: "bkt-kbj" }), updateBktKbj)
  .delete(requirePermission("delete", { moduleKey: "bkt-kbj" }), deleteBktKbj);

export default router;
