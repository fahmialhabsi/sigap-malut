// =====================================================
// ROUTES: UptTkn
// Base Path: /api/upt-tkn
// Generated: 2026-02-17T19:24:49.317Z
// =====================================================

import express from "express";
import {
  getAllUptTkn,
  getUptTknById,
  createUptTkn,
  updateUptTkn,
  deleteUptTkn,
} from "../controllers/UPT-TKN.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.route("/").get(getAllUptTkn).post(createUptTkn);

router.route("/:id").get(getUptTknById).put(updateUptTkn).delete(deleteUptTkn);

export default router;
