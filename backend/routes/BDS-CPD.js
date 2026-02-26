// =====================================================
// ROUTES: BdsCpd
// Base Path: /api/bds-cpd
// Generated: 2026-02-17T19:24:49.287Z
// =====================================================

import express from "express";
import {
  getAllBdsCpd,
  getBdsCpdById,
  createBdsCpd,
  updateBdsCpd,
  deleteBdsCpd,
} from "../controllers/BDS-CPD.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.route("/").get(getAllBdsCpd).post(createBdsCpd);

router.route("/:id").get(getBdsCpdById).put(updateBdsCpd).delete(deleteBdsCpd);

export default router;
