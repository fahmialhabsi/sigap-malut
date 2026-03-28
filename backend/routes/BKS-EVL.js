// =====================================================
// ROUTES: BksEvl
// Base Path: /api/bks-evl
// Generated: 2026-03-19T23:39:36.510Z
// =====================================================

import express from "express";
import {
  getAllBksEvl,
  getBksEvlById,
  createBksEvl,
  updateBksEvl,
  deleteBksEvl,
} from "../controllers/BKS-EVL.js";
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route("/").get(getAllBksEvl).post(createBksEvl);

// Summary route must come BEFORE /:id to prevent 'summary' being parsed as integer ID
router.get("/summary", getAllBksEvl);

router.route("/:id").get(getBksEvlById).put(updateBksEvl).delete(deleteBksEvl);

export default router;
