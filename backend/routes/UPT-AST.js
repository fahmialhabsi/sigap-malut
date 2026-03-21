// =====================================================
// ROUTES: UptAst
// Base Path: /api/upt-ast
// Generated: 2026-03-19T23:39:37.171Z
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
import { enforceUptdPilotAccess } from "../middleware/uptdPilotGuard.js";

const router = express.Router();

router.use(protect, enforceUptdPilotAccess);

router.route("/")
  .get(getAllUptAst)
  .post(createUptAst);

router.route("/:id")
  .get(getUptAstById)
  .put(updateUptAst)
  .delete(deleteUptAst);

export default router;
