// =====================================================
// ROUTES: UptTkn
// Base Path: /api/upt-tkn
// Generated: 2026-03-19T23:39:37.619Z
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
import { enforceUptdPilotAccess } from "../middleware/uptdPilotGuard.js";

const router = express.Router();

router.use(protect, enforceUptdPilotAccess);

router.route("/")
  .get(getAllUptTkn)
  .post(createUptTkn);

router.route("/:id")
  .get(getUptTknById)
  .put(updateUptTkn)
  .delete(deleteUptTkn);

export default router;
