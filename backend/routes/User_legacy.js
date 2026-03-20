// =====================================================
// ROUTES: UserLegacy
// Base Path: /api/user_legacy
// Generated: 2026-03-19T23:39:38.069Z
// =====================================================

import express from 'express';
import {
  getAllUserLegacy,
  getUserLegacyById,
  createUserLegacy,
  updateUserLegacy,
  deleteUserLegacy
} from '../controllers/User_legacy.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllUserLegacy)
  .post(createUserLegacy);

router.route('/:id')
  .get(getUserLegacyById)
  .put(updateUserLegacy)
  .delete(deleteUserLegacy);

export default router;
