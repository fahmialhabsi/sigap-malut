// =====================================================
// ROUTES: BktKrw
// Base Path: /api/bkt-krw
// Generated: 2026-02-17T19:24:49.301Z
// =====================================================

import express from "express";
import {
  getAllBktKrw,
  getBktKrwById,
  createBktKrw,
  updateBktKrw,
  deleteBktKrw,
} from "../controllers/BKT-KRW.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.route("/").get(getAllBktKrw).post(createBktKrw);

router.route("/:id").get(getBktKrwById).put(updateBktKrw).delete(deleteBktKrw);

export default router;
