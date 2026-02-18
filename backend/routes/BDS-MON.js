// =====================================================
// ROUTES: BdsMon
// Base Path: /api/bds-mon
// Generated: 2026-02-17T19:24:49.290Z
// =====================================================

import express from "express";
import {
  getAllBdsMon,
  getBdsMonById,
  createBdsMon,
  updateBdsMon,
  deleteBdsMon,
} from "../controllers/BDS-MON.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.route("/").get(getAllBdsMon).post(createBdsMon);

router.route("/:id").get(getBdsMonById).put(updateBdsMon).delete(deleteBdsMon);

export default router;
