// =====================================================
// ROUTES: SekKep
// Base Path: /api/sek-kep
// Generated: 2026-03-19T23:39:36.712Z
// =====================================================

import express from "express";
import {
  getAllSekKep,
  getSekKepById,
  createSekKep,
  updateSekKep,
  deleteSekKep,
} from "../controllers/SEK-KEP.js";
import { protect } from "../middleware/auth.js";
import { requirePermission } from "../middleware/permissionCheck.js";
import { maskFields } from "../middleware/fieldMask.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(
    requirePermission("sek-kep", "read"),
    maskFields("sek-kep"),
    getAllSekKep,
  )
  .post(requirePermission("sek-kep", "create"), createSekKep);

router
  .route("/:id")
  .get(
    requirePermission("sek-kep", "read"),
    maskFields("sek-kep"),
    getSekKepById,
  )
  .put(requirePermission("sek-kep", "update"), updateSekKep)
  .delete(requirePermission("sek-kep", "delete"), deleteSekKep);

export default router;
