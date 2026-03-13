// =====================================================
// ROUTES: BksDvr
// Base Path: /api/bks-dvr
// Generated: 2026-02-17T19:24:49.292Z
// =====================================================

import express from "express";
import {
  getAllBksDvr,
  getBksDvrById,
  createBksDvr,
  updateBksDvr,
  deleteBksDvr,
} from "../controllers/BKS-DVR.js";
import { protect } from "../middleware/auth.js";
import { requirePermission } from "../middleware/rbacMiddleware.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router
  .route("/")
  .get(requirePermission("read", { moduleKey: "bks-dvr" }), getAllBksDvr)
  .post(requirePermission("create", { moduleKey: "bks-dvr" }), createBksDvr);

router
  .route("/:id")
  .get(requirePermission("read", { moduleKey: "bks-dvr" }), getBksDvrById)
  .put(requirePermission("update", { moduleKey: "bks-dvr" }), updateBksDvr)
  .delete(requirePermission("delete", { moduleKey: "bks-dvr" }), deleteBksDvr);

export default router;
