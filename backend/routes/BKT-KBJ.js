// =====================================================
// ROUTES: BktKbj
// Base Path: /api/bkt-kbj
// Generated: 2026-02-17T19:24:49.300Z
// =====================================================

import express from "express";
import {
  getAllBktKbj,
  getBktKbjById,
  createBktKbj,
  updateBktKbj,
  deleteBktKbj,
} from "../controllers/BKT-KBJ.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.route("/").get(getAllBktKbj).post(createBktKbj);

router.route("/:id").get(getBktKbjById).put(updateBktKbj).delete(deleteBktKbj);

export default router;
