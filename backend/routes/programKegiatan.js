// backend/routes/programKegiatan.js
// Base: /api/program-kegiatan + /api/dokumen-perencanaan

import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  listProgramKegiatan,
  updateRealisasiProgram,
  listDokumen,
  createDokumen,
  submitDokumen,
  updateDokumen,
} from "../controllers/dashboardFungsionalPerencanaController.js";

const router = Router();
router.use(protect);

// Program Kegiatan
router.get("/program-kegiatan", listProgramKegiatan);
router.put("/program-kegiatan/:id/update-realisasi", updateRealisasiProgram);

// Dokumen Perencanaan
router.get("/dokumen-perencanaan", listDokumen);
router.post("/dokumen-perencanaan", createDokumen);
router.put("/dokumen-perencanaan/:id", updateDokumen);
router.post("/dokumen-perencanaan/:id/submit", submitDokumen);

export default router;
