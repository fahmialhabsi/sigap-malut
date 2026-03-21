// =====================================================
// ROUTES: Workflowhistory
// Base Path: /api/workflowhistory
// Generated: 2026-03-19T23:39:38.534Z
// =====================================================

import express from 'express';
import {
  getAllWorkflowhistory,
  getWorkflowhistoryById,
  createWorkflowhistory,
  updateWorkflowhistory,
  deleteWorkflowhistory
} from '../controllers/WorkflowHistory.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllWorkflowhistory)
  .post(createWorkflowhistory);

router.route('/:id')
  .get(getWorkflowhistoryById)
  .put(updateWorkflowhistory)
  .delete(deleteWorkflowhistory);

export default router;
