// =====================================================
// ROUTES: BksKmn
// Base Path: /api/bks-kmn
// Generated: 2026-02-17T19:24:49.297Z
// =====================================================

import express from "express";
import {
  getAllBksKmn,
  getBksKmnById,
  createBksKmn,
  updateBksKmn,
  deleteBksKmn,
} from "../controllers/BKS-KMN.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.route("/").get(getAllBksKmn).post(createBksKmn);

router.route("/:id").get(getBksKmnById).put(updateBksKmn).delete(deleteBksKmn);

export default router;
