import express from "express";
import {
  getDashboardSummary,
  getKgbAlertCount,
} from "../../controllers/sekretaris/dashboardSummaryController.js";
import { sekretarisGuard } from "../../middleware/sekretarisGuard.js";

const router = express.Router();

// protect all routes
router.use(sekretarisGuard);

// routes
router.get("/summary", getDashboardSummary);
router.get("/kgb-alert/count", getKgbAlertCount);

export default router;
