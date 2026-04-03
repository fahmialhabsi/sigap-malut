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

// GET /api/audit-trail?modul=&aksi=&pegawai_id=&entitas_id=&start=&end=&limit=&page=
router.get("/", getAuditLogs);

// GET /api/audit-trail/export?format=csv|json&...filter
router.get("/export", exportAuditLogs);

export default router;
