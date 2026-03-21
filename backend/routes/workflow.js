// =====================================================
// ROUTES: Workflow
// Base Path: /api/workflow
// Generated: 2026-03-19T23:39:38.178Z
// =====================================================

import express from 'express';
import {
  getAllWorkflow,
  getWorkflowById,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow
} from '../controllers/workflow.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllWorkflow)
  .post(createWorkflow);

router.route('/:id')
  .get(getWorkflowById)
  .put(updateWorkflow)
  .delete(deleteWorkflow);

export default router;
