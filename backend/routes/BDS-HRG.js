// =====================================================
// ROUTES: BdsHrg
// Base Path: /api/bds-hrg
// Generated: 2026-02-17T19:24:49.289Z
// =====================================================

import express from "express";
import {
  getAllBdsHrg,
  getBdsHrgById,
  createBdsHrg,
  updateBdsHrg,
  deleteBdsHrg,
} from "../controllers/BDS-HRG.js";
import { protect } from "../middleware/auth.js";
import { requirePermission } from "../middleware/rbacMiddleware.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router
  .route("/")
  .get(requirePermission("read", { moduleKey: "bds-hrg" }), getAllBdsHrg)
  .post(requirePermission("create", { moduleKey: "bds-hrg" }), createBdsHrg);

router
  .route("/:id")
  .get(requirePermission("read", { moduleKey: "bds-hrg" }), getBdsHrgById)
  .put(requirePermission("update", { moduleKey: "bds-hrg" }), updateBdsHrg)
  .delete(requirePermission("delete", { moduleKey: "bds-hrg" }), deleteBdsHrg);

export default router;
