/**
 * backend/routes/komoditasStock.js
 *
 * Route: GET /api/komoditas/stock
 * (terpisah dari routes/komoditas.js untuk menghindari konflik)
 */

import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { requireAnyPermission } from "../middleware/permissionCheck.js";
import { getKomoditasStock } from "../controllers/dashboardController.js";

const router = Router();

router.use(protect);

router.get(
  "/stock",
  requireAnyPermission(["komoditas:read", "stok:read", "dashboard:read"]),
  getKomoditasStock
);

export default router;
