import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getExecutionThreadDetail,
  getExecutionHubSummary,
  getHierarchyKpiRollup,
  getCrossThreadAnalytics,
} from "../controllers/executionThreadController.js";

const router = express.Router();
router.use(protect);
router.get("/hub/summary", getExecutionHubSummary);
router.get("/kpi/hierarchy", getHierarchyKpiRollup);
router.get("/analytics/cross", getCrossThreadAnalytics);
router.get("/:id", getExecutionThreadDetail);

export default router;
