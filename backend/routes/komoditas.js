// =====================================================
// ROUTES: Komoditas
// Base Path: /api/komoditas
// Generated: 2026-03-19T23:39:36.598Z
// =====================================================

import express from "express";
import {
  getAllKomoditas,
  getKomoditasById,
  createKomoditas,
  updateKomoditas,
  deleteKomoditas,
} from "../controllers/komoditas.js";
import { protect } from "../middleware/auth.js";
import { requirePermission } from "../middleware/permissionCheck.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(requirePermission("komoditas", "read"), getAllKomoditas)
  .post(requirePermission("komoditas", "create"), createKomoditas);

router
  .route("/:id")
  .get(requirePermission("komoditas", "read"), getKomoditasById)
  .put(requirePermission("komoditas", "update"), updateKomoditas)
  .delete(requirePermission("komoditas", "delete"), deleteKomoditas);

export default router;
