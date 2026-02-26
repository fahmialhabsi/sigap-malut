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

const router = express.Router();

// All routes are protected
router.use(protect);

router.route("/").get(getAllBdsHrg).post(createBdsHrg);

router.route("/:id").get(getBdsHrgById).put(updateBdsHrg).delete(deleteBdsHrg);

export default router;
