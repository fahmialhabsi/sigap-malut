// =====================================================
// ROUTES: BdsHrg
// Base Path: /api/bds-hrg
// Generated: 2026-03-19T23:39:36.486Z
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
import { requirePermission } from "../middleware/permissionCheck.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(requirePermission("bds-hrg", "read"), getAllBdsHrg)
  .post(requirePermission("bds-hrg", "create"), createBdsHrg);

router
  .route("/:id")
  .get(requirePermission("bds-hrg", "read"), getBdsHrgById)
  .put(requirePermission("bds-hrg", "update"), updateBdsHrg)
  .delete(requirePermission("bds-hrg", "delete"), deleteBdsHrg);

export default router;
