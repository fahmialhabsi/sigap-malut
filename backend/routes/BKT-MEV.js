// =====================================================
// ROUTES: BktMev
// Base Path: /api/bkt-mev
// Generated: 2026-02-17T19:24:49.301Z
// =====================================================

import express from "express";
import {
  getAllBktMev,
  getBktMevById,
  createBktMev,
  updateBktMev,
  deleteBktMev,
} from "../controllers/BKT-MEV.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.route("/").get(getAllBktMev).post(createBktMev);

router.route("/:id").get(getBktMevById).put(updateBktMev).delete(deleteBktMev);

export default router;
