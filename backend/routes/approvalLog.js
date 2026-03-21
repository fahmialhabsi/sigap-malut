// =====================================================
// ROUTES: Approvallog
// Base Path: /api/approvallog
// Generated: 2026-03-19T23:39:36.435Z
// =====================================================

import express from 'express';
import {
  getAllApprovallog,
  getApprovallogById,
  createApprovallog,
  updateApprovallog,
  deleteApprovallog
} from '../controllers/approvalLog.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllApprovallog)
  .post(createApprovallog);

router.route('/:id')
  .get(getApprovallogById)
  .put(updateApprovallog)
  .delete(deleteApprovallog);

export default router;
