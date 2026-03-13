// =====================================================
// ROUTES: SekAdm
// Base Path: /api/sek-adm
// Generated: 2026-02-17T19:24:49.303Z
// =====================================================

import express from "express";
import {
  getAllSekAdm,
  getSekAdmById,
  createSekAdm,
  updateSekAdm,
  deleteSekAdm,
} from "../controllers/SEK-ADM.js";
import { protect } from "../middleware/auth.js";
import { requirePermission } from "../middleware/rbacMiddleware.js";

const router = express.Router();

// All routes are protected
router.use(protect);

router
  .route("/")
  .get(requirePermission("read", { moduleKey: "sek-adm" }), getAllSekAdm)
  .post(requirePermission("create", { moduleKey: "sek-adm" }), createSekAdm);

router
  .route("/:id")
  .get(requirePermission("read", { moduleKey: "sek-adm" }), getSekAdmById)
  .put(requirePermission("update", { moduleKey: "sek-adm" }), updateSekAdm)
  .delete(requirePermission("delete", { moduleKey: "sek-adm" }), deleteSekAdm);

export default router;
