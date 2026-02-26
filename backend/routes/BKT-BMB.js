// =====================================================
// ROUTES: BktBmb
// Base Path: /api/bkt-bmb
// Generated: 2026-02-17T19:24:49.298Z
// =====================================================

import express from "express";
import {
  getAllBktBmb,
  getBktBmbById,
  createBktBmb,
  updateBktBmb,
  deleteBktBmb,
} from "../controllers/BKT-BMB.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.route("/").get(getAllBktBmb).post(createBktBmb);

router.route("/:id").get(getBktBmbById).put(updateBktBmb).delete(deleteBktBmb);

export default router;
