// =====================================================
// ROUTES: BksDvr
// Base Path: /api/bks-dvr
// Generated: 2026-02-17T19:24:49.292Z
// =====================================================

import express from "express";
import {
  getAllBksDvr,
  getBksDvrById,
  createBksDvr,
  updateBksDvr,
  deleteBksDvr,
} from "../controllers/BKS-DVR.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.route("/").get(getAllBksDvr).post(createBksDvr);

router.route("/:id").get(getBksDvrById).put(updateBksDvr).delete(deleteBksDvr);

export default router;
