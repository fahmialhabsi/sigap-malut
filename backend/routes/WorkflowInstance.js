// =====================================================
// ROUTES: Workflowinstance
// Base Path: /api/workflowinstance
// Generated: 2026-03-19T23:39:39.099Z
// =====================================================

import express from 'express';
import {
  getAllWorkflowinstance,
  getWorkflowinstanceById,
  createWorkflowinstance,
  updateWorkflowinstance,
  deleteWorkflowinstance
} from '../controllers/WorkflowInstance.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllWorkflowinstance)
  .post(createWorkflowinstance);

router.route('/:id')
  .get(getWorkflowinstanceById)
  .put(updateWorkflowinstance)
  .delete(deleteWorkflowinstance);

export default router;
