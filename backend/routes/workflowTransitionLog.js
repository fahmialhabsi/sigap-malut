// =====================================================
// ROUTES: Workflowtransitionlog
// Base Path: /api/workflowtransitionlog
// Generated: 2026-03-19T23:39:39.436Z
// =====================================================

import express from 'express';
import {
  getAllWorkflowtransitionlog,
  getWorkflowtransitionlogById,
  createWorkflowtransitionlog,
  updateWorkflowtransitionlog,
  deleteWorkflowtransitionlog
} from '../controllers/workflowTransitionLog.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllWorkflowtransitionlog)
  .post(createWorkflowtransitionlog);

router.route('/:id')
  .get(getWorkflowtransitionlogById)
  .put(updateWorkflowtransitionlog)
  .delete(deleteWorkflowtransitionlog);

export default router;
