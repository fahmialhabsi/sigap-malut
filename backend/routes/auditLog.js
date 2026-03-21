// =====================================================
// ROUTES: Auditlog
// Base Path: /api/auditlog
// Generated: 2026-03-19T23:39:36.455Z
// =====================================================

import express from 'express';
import {
  getAllAuditlog,
  getAuditlogById,
  createAuditlog,
  updateAuditlog,
  deleteAuditlog
} from '../controllers/auditLog.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllAuditlog)
  .post(createAuditlog);

router.route('/:id')
  .get(getAuditlogById)
  .put(updateAuditlog)
  .delete(deleteAuditlog);

export default router;
