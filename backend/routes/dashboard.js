/**
 * backend/routes/dashboard.js
 *
 * Routes untuk Dashboard KPI endpoints:
 *  GET /api/dashboard/sekretaris/summary   — KPI sekretaris (izin terbatas)
 *  GET /api/dashboard/super-admin/summary  — agregat sistem (hanya super_admin)
 *  GET /api/inflasi/latest               — inflasi pangan weighted
 *  GET /api/komoditas/stock              — stok & harga per komoditas
 */

import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/roleCheck.js";
import { requireAnyPermission } from "../middleware/permissionCheck.js";
import { withCache } from "../middleware/cacheMiddleware.js";
import { TTL } from "../services/cacheService.js";
import {
  getSekretarisSummary,
  getSuperAdminSummary,
  getInflasiLatest,
  getKomoditasStock,
} from "../controllers/dashboardController.js";
import { getRenjaRkpdSummary } from "../controllers/planningRenjaRkpdDashboardController.js";

const router = Router();

// All dashboard routes require authentication
router.use(protect);

// Ringkasan System Control Center — hanya super_admin (matriks dokumen 14)
router.get(
  "/super-admin/summary",
  authorize("super_admin"),
  withCache("dashboard:super-admin", TTL.DASHBOARD),
  getSuperAdminSummary,
);

// KPI summary for Sekretaris dashboard — accessible by sekretaris, kepala_dinas, super_admin
router.get(
  "/sekretaris/summary",
  requireAnyPermission(["dashboard:read", "sek-keu:read"]),
  withCache("dashboard:sekretaris", TTL.DASHBOARD),
  getSekretarisSummary,
);

router.get(
  "/renja-summary",
  requireAnyPermission(["dashboard:read", "sek-keu:read"]),
  getRenjaRkpdSummary,
);

export default router;
