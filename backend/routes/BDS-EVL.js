// =====================================================
// ROUTES: BdsEvl
// Base Path: /api/bds-evl
// Generated: 2026-02-17T19:24:49.288Z
// =====================================================

import express from "express";
import {
  getAllBdsEvl,
  getBdsEvlById,
  createBdsEvl,
  updateBdsEvl,
  deleteBdsEvl,
} from "../controllers/BDS-EVL.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.route("/").get(getAllBdsEvl).post(createBdsEvl);

router.route("/:id").get(getBdsEvlById).put(updateBdsEvl).delete(deleteBdsEvl);

export default router;
