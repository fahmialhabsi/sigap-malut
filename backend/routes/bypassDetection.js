// =====================================================
// ROUTES: Bypassdetection
// Base Path: /api/bypassdetection
// Generated: 2026-03-19T23:39:36.562Z
// =====================================================

import express from "express";
import {
  getAllBypassdetection,
  getBypassdetectionById,
  createBypassdetection,
  updateBypassdetection,
  deleteBypassdetection,
} from "../controllers/bypassDetection.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes protected — hanya user terautentikasi yang bisa akses log bypass
router.use(protect);

router.route("/").get(getAllBypassdetection).post(createBypassdetection);

router
  .route("/:id")
  .get(getBypassdetectionById)
  .put(updateBypassdetection)
  .delete(deleteBypassdetection);

export default router;
