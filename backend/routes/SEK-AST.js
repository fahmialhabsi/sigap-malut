// =====================================================
// ROUTES: SekAst
// Base Path: /api/sek-ast
// Generated: 2026-03-19T23:39:36.637Z
// =====================================================

import express from 'express';
import {
  getAllSekAst,
  getSekAstById,
  createSekAst,
  updateSekAst,
  deleteSekAst
} from '../controllers/SEK-AST.js';
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route('/')
  .get(getAllSekAst)
  .post(createSekAst);

router.route('/:id')
  .get(getSekAstById)
  .put(updateSekAst)
  .delete(deleteSekAst);

export default router;
