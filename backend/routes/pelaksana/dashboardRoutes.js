// backend/routes/pelaksana/dashboardRoutes.js
// Routes Dashboard Pelaksana SEKRETARIAT

import express from "express";
import {
  getPelaksanaSummary,
  getTugasHariIni,
} from "../../controllers/pelaksana/dashboardPelaksanaController.js";
import { pelaksanaRoleGuard } from "../../middleware/pelaksanaRoleGuard.js";
import { protect } from "../../middleware/auth.js";

const router = express.Router();

router.use(protect, pelaksanaRoleGuard);

// GET /api/pelaksana/dashboard/summary — 4 KPI tiles + absensi strip
router.get("/summary", getPelaksanaSummary);

// GET /api/pelaksana/tugas/hari-ini — Kanban mini panel
router.get("/tugas/hari-ini", getTugasHariIni);

export default router;
