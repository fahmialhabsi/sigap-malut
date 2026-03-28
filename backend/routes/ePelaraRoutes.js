// backend/routes/ePelaraRoutes.js
// Q2/Q3: Route proxy SIGAP → e-Pelara API.
// Semua akses dilindungi middleware auth SIGAP (verifyToken) — tidak ada endpoint publik.

import { Router } from "express";
import { protect } from "../middleware/auth.js";
import * as ctrl from "../controllers/ePelaraController.js";

const router = Router();

// Semua route di bawah ini memerlukan token SIGAP yang valid.
router.use(protect);

// ─── Perencanaan Strategis ─────────────────────────────────────────────────────
router.get("/visi-misi", ctrl.getVisiMisi);
router.get("/prioritas-gubernur", ctrl.getPrioritasGubernur);
router.get("/prioritas-nasional", ctrl.getPrioritasNasional);
router.get("/prioritas", ctrl.getPrioritas);

// ─── Program & Kegiatan ───────────────────────────────────────────────────────
router.get("/program", ctrl.getProgram);
router.get("/kegiatan", ctrl.getKegiatan);
router.get("/sub-kegiatan", ctrl.getSubKegiatan);

// ─── Renstra ──────────────────────────────────────────────────────────────────
router.get("/renstra-opd", ctrl.getRenstraOpd);
router.get("/renstra-tujuan", ctrl.getRenstraTujuan);
router.get("/renstra-sasaran", ctrl.getRenstraSasaran);
router.get("/renstra-program", ctrl.getRenstraProgram);
router.get("/renstra-kegiatan", ctrl.getRenstraKegiatan);
router.get("/renstra-sub-kegiatan", ctrl.getRenstraSubKegiatan);
router.get("/target-renstra", ctrl.getTargetRenstra);

// ─── Dokumen Anggaran ─────────────────────────────────────────────────────────
router.get("/renja", ctrl.getRenja);
router.get("/rka", ctrl.getRka);
router.get("/dpa", ctrl.getDpa);

// ─── Monitoring & Evaluasi ────────────────────────────────────────────────────
router.get("/realisasi-indikator", ctrl.getRealisasiIndikator);
router.get("/monev", ctrl.getMonev);
router.get("/lakip", ctrl.getLakip);

// ─── Alias convenience routes ────────────────────────────────────────────────
router.get("/visi", ctrl.getVisiMisi); // alias ke visi-misi
router.get("/misi", ctrl.getVisiMisi); // alias ke visi-misi

// ─── Approve / TTD Digital (Kepala Dinas inline action) ─────────────────────
router.patch("/renstra-opd/:id/approve", ctrl.approveRenstra);

// ─── Aggregasi (dipakai dashboard SIGAP) ─────────────────────────────────────
router.get("/cascading", ctrl.getCascading);
router.get("/ringkasan-perencanaan", ctrl.getRingkasanPerencanaan);

export default router;
