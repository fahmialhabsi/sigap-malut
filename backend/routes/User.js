// =====================================================
// ROUTES: User
// Base Path: /api/user
// Generated: 2026-03-19T23:39:37.844Z
// =====================================================

import express from 'express';
import {
  getAllUser,
  getUserById,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/User.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllUser)
  .post(createUser);

router.route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

export default router;
