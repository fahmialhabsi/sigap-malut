// =====================================================
// ROUTES: SekKbj
// Base Path: /api/sek-kbj
// Generated: 2026-03-19T23:39:36.705Z
// =====================================================

import express from 'express';
import {
  getAllSekKbj,
  getSekKbjById,
  createSekKbj,
  updateSekKbj,
  deleteSekKbj
} from '../controllers/SEK-KBJ.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllSekKbj)
  .post(createSekKbj);

router.route('/:id')
  .get(getSekKbjById)
  .put(updateSekKbj)
  .delete(deleteSekKbj);

export default router;
