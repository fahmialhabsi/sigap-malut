import express from "express";
import { protect } from "../middleware/auth.js";
import { exportSpipReport } from "../controllers/spipReportController.js";
import { getSpipEvidenceSummary } from "../controllers/spipEvidenceController.js";
import {
  createEvidenceLink,
  createMonitoring,
  createRisk,
  createRtp,
  listEvidenceLinks,
  listMonitoring,
  listRisks,
  listRtps,
} from "../controllers/spipDataController.js";

const router = express.Router();

// GET /api/spip/report/export?source=master|db&format=xlsx&granularity=day|month|year&date=YYYY-MM-DD&year=2025&month=4
router.get("/report/export", protect, exportSpipReport);

// GET /api/spip/evidence/summary?granularity=day|month|year&date=YYYY-MM-DD&year=2025&month=4&limit=100
router.get("/evidence/summary", protect, getSpipEvidenceSummary);

// Minimal input endpoints (DB-driven SPIP)
router.get("/risk", protect, listRisks);
router.post("/risk", protect, createRisk);

router.get("/rtp", protect, listRtps);
router.post("/rtp", protect, createRtp);

router.get("/monitoring", protect, listMonitoring);
router.post("/monitoring", protect, createMonitoring);

router.get("/evidence/link", protect, listEvidenceLinks);
router.post("/evidence/link", protect, createEvidenceLink);

export default router;

