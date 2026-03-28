/**
 * backend/routes/inflasi.js
 *
 * Route: GET /api/inflasi/latest
 */

import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { requireAnyPermission } from "../middleware/permissionCheck.js";
import { withCache } from "../middleware/cacheMiddleware.js";
import { getInflasiLatest } from "../controllers/dashboardController.js";
import { TTL } from "../services/cacheService.js";

const router = Router();

router.use(protect);

router.get(
  "/latest",
  requireAnyPermission(["inflasi:read", "komoditas:read", "dashboard:read"]),
  withCache("inflasi", TTL.KPI),
  getInflasiLatest,
);

export default router;
