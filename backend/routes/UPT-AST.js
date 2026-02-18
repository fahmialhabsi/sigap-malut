// =====================================================
// ROUTES: UptAst
// Base Path: /api/upt-ast
// Generated: 2026-02-17T19:24:49.313Z
// =====================================================

import express from "express";
import {
  getAllUptAst,
  getUptAstById,
  createUptAst,
  updateUptAst,
  deleteUptAst,
} from "../controllers/UPT-AST.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router.route("/").get(getAllUptAst).post(createUptAst);

router.route("/:id").get(getUptAstById).put(updateUptAst).delete(deleteUptAst);

export default router;
