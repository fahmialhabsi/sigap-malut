/**
 * backend/routes/dashboard.js
 *
 * Routes untuk Dashboard KPI endpoints:
 *  GET /api/dashboard/sekretaris/summary  — 5 KPI wajib sekretaris
 *  GET /api/inflasi/latest               — inflasi pangan weighted
 *  GET /api/komoditas/stock              — stok & harga per komoditas
 */

import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { requireAnyPermission } from "../middleware/permissionCheck.js";
import { withCache } from "../middleware/cacheMiddleware.js";
import { TTL } from "../services/cacheService.js";
import {
  getSekretarisSummary,
  getInflasiLatest,
  getKomoditasStock,
} from "../controllers/dashboardController.js";

const router = Router();

// All dashboard routes require authentication
router.use(protect);

// KPI summary for Sekretaris dashboard — accessible by sekretaris, kepala_dinas, super_admin
router.get(
  "/sekretaris/summary",
  requireAnyPermission(["dashboard:read", "sek-keu:read"]),
  withCache("dashboard:sekretaris", TTL.DASHBOARD),
  getSekretarisSummary,
);

export default router;
