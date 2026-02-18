// =====================================================
// ROUTES: BksKbj
// Base Path: /api/bks-kbj
// Generated: 2026-02-17T19:24:49.295Z
// =====================================================

import express from "express";
import {
  getAllBksKbj,
  getBksKbjById,
  createBksKbj,
  updateBksKbj,
  deleteBksKbj,
} from "../controllers/BKS-KBJ.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.route("/").get(getAllBksKbj).post(createBksKbj);

router.route("/:id").get(getBksKbjById).put(updateBksKbj).delete(deleteBksKbj);

export default router;
