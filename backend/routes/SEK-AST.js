// =====================================================
// ROUTES: SekAst
// Base Path: /api/sek-ast
// Generated: 2026-02-17T19:24:49.304Z
// =====================================================

import express from "express";
import {
  getAllSekAst,
  getSekAstById,
  createSekAst,
  updateSekAst,
  deleteSekAst,
} from "../controllers/SEK-AST.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.route("/").get(getAllSekAst).post(createSekAst);

router.route("/:id").get(getSekAstById).put(updateSekAst).delete(deleteSekAst);

export default router;
