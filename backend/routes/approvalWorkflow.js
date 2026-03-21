// =====================================================
// ROUTES: Approvalworkflow
// Base Path: /api/approvalworkflow
// Generated: 2026-03-19T23:39:36.450Z
// =====================================================

import express from 'express';
import {
  getAllApprovalworkflow,
  getApprovalworkflowById,
  createApprovalworkflow,
  updateApprovalworkflow,
  deleteApprovalworkflow
} from '../controllers/approvalWorkflow.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllApprovalworkflow)
  .post(createApprovalworkflow);

router.route('/:id')
  .get(getApprovalworkflowById)
  .put(updateApprovalworkflow)
  .delete(deleteApprovalworkflow);

export default router;
