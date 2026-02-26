// =====================================================
// ROUTES: BktPgd
// Base Path: /api/bkt-pgd
// Generated: 2026-02-17T19:24:49.302Z
// =====================================================

import express from "express";
import {
  getAllBktPgd,
  getBktPgdById,
  createBktPgd,
  updateBktPgd,
  deleteBktPgd,
} from "../controllers/BKT-PGD.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.route("/").get(getAllBktPgd).post(createBktPgd);

router.route("/:id").get(getBktPgdById).put(updateBktPgd).delete(deleteBktPgd);

export default router;
