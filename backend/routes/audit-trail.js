import express from "express";
import {
  getAuditLogs,
  exportAuditLogs,
} from "../controllers/auditLogController.js";
const router = express.Router();

// GET /api/audit-trail?modul=&aksi=&pegawai_id=&entitas_id=&start=&end=&limit=&page=
router.get("/", getAuditLogs);

// GET /api/audit-trail/export?format=csv|json&...filter
router.get("/export", exportAuditLogs);

export default router;
