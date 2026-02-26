// =====================================================
// ROUTES: UptMtu
// Base Path: /api/upt-mtu
// Generated: 2026-02-17T19:24:49.316Z
// =====================================================

import express from "express";
import {
  getAllUptMtu,
  getUptMtuById,
  createUptMtu,
  updateUptMtu,
  deleteUptMtu,
} from "../controllers/UPT-MTU.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.route("/").get(getAllUptMtu).post(createUptMtu);

router.route("/:id").get(getUptMtuById).put(updateUptMtu).delete(deleteUptMtu);

export default router;
