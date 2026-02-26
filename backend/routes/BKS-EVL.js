// =====================================================
// ROUTES: BksEvl
// Base Path: /api/bks-evl
// Generated: 2026-02-17T19:24:49.294Z
// =====================================================

import express from "express";
import {
  getAllBksEvl,
  getBksEvlById,
  createBksEvl,
  updateBksEvl,
  deleteBksEvl,
} from "../controllers/BKS-EVL.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.route("/").get(getAllBksEvl).post(createBksEvl);

router.route("/:id").get(getBksEvlById).put(updateBksEvl).delete(deleteBksEvl);

export default router;
