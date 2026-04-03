// =====================================================
// Routes: Audit log (controller) — /api/auditlogcontroller
// =====================================================

import express from "express";
import {
  getAuditLogs,
  exportAuditLogs,
} from "../controllers/auditLogController.js";
import { protect } from "../middleware/auth.js";
import { requirePermission } from "../middleware/permissionCheck.js";

const router = express.Router();

router.use(protect);
router.use(requirePermission("audit-log", "read"));

router.get("/", getAuditLogs);
router.get("/export", exportAuditLogs);

export default router;
