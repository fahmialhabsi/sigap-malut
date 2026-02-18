// =====================================================
// ROUTES: BksLap
// Base Path: /api/bks-lap
// Generated: 2026-02-17T19:24:49.298Z
// =====================================================

import express from "express";
import {
  getAllBksLap,
  getBksLapById,
  createBksLap,
  updateBksLap,
  deleteBksLap,
} from "../controllers/BKS-LAP.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.route("/").get(getAllBksLap).post(createBksLap);

router.route("/:id").get(getBksLapById).put(updateBksLap).delete(deleteBksLap);

export default router;
