// =====================================================
// ROUTES: BktFsl
// Base Path: /api/bkt-fsl
// Generated: 2026-02-17T19:24:49.299Z
// =====================================================

import express from "express";
import {
  getAllBktFsl,
  getBktFslById,
  createBktFsl,
  updateBktFsl,
  deleteBktFsl,
} from "../controllers/BKT-FSL.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.route("/").get(getAllBktFsl).post(createBktFsl);

router.route("/:id").get(getBktFslById).put(updateBktFsl).delete(deleteBktFsl);

export default router;
