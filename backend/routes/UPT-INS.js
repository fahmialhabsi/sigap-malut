// =====================================================
// ROUTES: UptIns
// Base Path: /api/upt-ins
// Generated: 2026-02-17T19:24:49.314Z
// =====================================================

import express from "express";
import {
  getAllUptIns,
  getUptInsById,
  createUptIns,
  updateUptIns,
  deleteUptIns,
} from "../controllers/UPT-INS.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.route("/").get(getAllUptIns).post(createUptIns);

router.route("/:id").get(getUptInsById).put(updateUptIns).delete(deleteUptIns);

export default router;
