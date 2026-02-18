// =====================================================
// ROUTES: BdsBmb
// Base Path: /api/bds-bmb
// Generated: 2026-02-17T19:24:49.284Z
// =====================================================

import express from "express";
import {
  getAllBdsBmb,
  getBdsBmbById,
  createBdsBmb,
  updateBdsBmb,
  deleteBdsBmb,
} from "../controllers/BDS-BMB.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.route("/").get(getAllBdsBmb).post(createBdsBmb);

router.route("/:id").get(getBdsBmbById).put(updateBdsBmb).delete(deleteBdsBmb);

export default router;
