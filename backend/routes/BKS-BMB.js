// =====================================================
// ROUTES: BksBmb
// Base Path: /api/bks-bmb
// Generated: 2026-02-17T19:24:49.291Z
// =====================================================

import express from "express";
import {
  getAllBksBmb,
  getBksBmbById,
  createBksBmb,
  updateBksBmb,
  deleteBksBmb,
} from "../controllers/BKS-BMB.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.route("/").get(getAllBksBmb).post(createBksBmb);

router.route("/:id").get(getBksBmbById).put(updateBksBmb).delete(deleteBksBmb);

export default router;
