// =====================================================
// ROUTES: BdsKbj
// Base Path: /api/bds-kbj
// Generated: 2026-02-17T19:24:49.289Z
// =====================================================

import express from "express";
import {
  getAllBdsKbj,
  getBdsKbjById,
  createBdsKbj,
  updateBdsKbj,
  deleteBdsKbj,
} from "../controllers/BDS-KBJ.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.route("/").get(getAllBdsKbj).post(createBdsKbj);

router.route("/:id").get(getBdsKbjById).put(updateBdsKbj).delete(deleteBdsKbj);

export default router;
