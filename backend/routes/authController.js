// =====================================================
// ROUTES: Authcontroller
// Base Path: /api/authcontroller
// Generated: 2026-03-19T23:39:36.467Z
// =====================================================

import express from 'express';
import {
  register,
  login,
  getMe,
  logout,
  changePassword,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/authController.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.post('/register', register);
router.post('/login', login);
router.get('/me', getMe);
router.post('/logout', logout);
router.put('/change-password', changePassword);

router.route('/')
  .get(getAllUsers)
  .post(createUser);

router.route('/:id')
  .put(updateUser)
  .delete(deleteUser);

export default router;
