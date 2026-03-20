// =====================================================
// ROUTES: Auditlogcontroller
// Base Path: /api/auditlogcontroller
// Generated: 2026-03-19T23:39:36.461Z
// =====================================================

import express from 'express';
import {
  getAuditLogs,
  exportAuditLogs
} from '../controllers/auditLogController.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.get('/', getAuditLogs);
router.get('/export', exportAuditLogs);

export default router;
