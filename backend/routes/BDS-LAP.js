// =====================================================
// ROUTES: BdsLap
// Base Path: /api/bds-lap
// Generated: 2026-02-17T19:24:49.290Z
// =====================================================

import express from "express";
import {
  getAllBdsLap,
  getBdsLapById,
  createBdsLap,
  updateBdsLap,
  deleteBdsLap,
} from "../controllers/BDS-LAP.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.route("/").get(getAllBdsLap).post(createBdsLap);

router.route("/:id").get(getBdsLapById).put(updateBdsLap).delete(deleteBdsLap);

export default router;
