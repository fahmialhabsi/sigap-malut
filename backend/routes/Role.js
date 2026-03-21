// =====================================================
// ROUTES: Role
// Base Path: /api/role
// Generated: 2026-03-19T23:39:36.633Z
// =====================================================

import express from 'express';
import {
  getAllRole,
  getRoleById,
  createRole,
  updateRole,
  deleteRole
} from '../controllers/Role.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllRole)
  .post(createRole);

router.route('/:id')
  .get(getRoleById)
  .put(updateRole)
  .delete(deleteRole);

export default router;
