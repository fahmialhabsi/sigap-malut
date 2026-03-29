// backend/routes/sekretaris/index.js
// Mount semua route sekretaris — dipasang di server.js sebagai /api/sekretaris

import express from "express";
import { protect } from "../../middleware/auth.js";
import { requireAnyPermission } from "../../middleware/permissionCheck.js";

import {
  getInboxKadin, getInboxKadinDetail, getInboxKadinStats,
  konfirmasiTerima, distribusiKeBawahan, laporSelesai,
} from "../../controllers/sekretaris/inboxKadinController.js";

import {
  getApprovalQueue, getApprovalDetail, putuskanApproval,
  teruskankKaDin, getRiwayatRevisi, submitApproval,
} from "../../controllers/sekretaris/approvalQueueController.js";

import {
  getMonitorBawahan, getMonitorBawahanDetail, getOverdueTasks,
  getPerintahKeBawahan, buatPerintah, ingatkanBawahan, eskalasiPerintah,
} from "../../controllers/sekretaris/monitorBawahanController.js";

import {
  getScorecardBawahan, getScorecardDetail,
  isiSkp, getSkpHistory, finalizeSkp,
} from "../../controllers/sekretaris/scorecardController.js";

import {
  getSemuaKpi, getKpiAlert, getBypassList, kirimTeguran,
} from "../../controllers/sekretaris/kpiBypassController.js";

import {
  getKonsolidasi, getRiwayatKonsolidasi, unitSubmit,
  generateKonsolidasi, teruskankKadinKonsolidasi,
} from "../../controllers/sekretaris/konsolidasiController.js";

import {
  getSppgStatus, getTpidData,
} from "../../controllers/sekretaris/programPrioritasController.js";

import {
  getNotifikasi, tandaiBaca, tandaiBacaSemua,
} from "../../controllers/sekretaris/notifikasiSekretarisController.js";

const router = express.Router();

// Semua route butuh auth
router.use(protect);

// Permission untuk sekretaris + admin
const sekPerm = requireAnyPermission(["dashboard:read", "sekretaris:read", "sekretaris:write"]);
const sekWrite = requireAnyPermission(["sekretaris:write", "admin:write"]);

// ─── INBOX KEPALA DINAS ─────────────────────────────────────────────────────
router.get("/inbox-kadin", sekPerm, getInboxKadin);
router.get("/inbox-kadin/stats", sekPerm, getInboxKadinStats);
router.get("/inbox-kadin/:id", sekPerm, getInboxKadinDetail);
router.post("/inbox-kadin/:id/konfirmasi", sekPerm, konfirmasiTerima);
router.post("/inbox-kadin/:id/distribusi", sekPerm, distribusiKeBawahan);
router.post("/inbox-kadin/:id/lapor-selesai", sekPerm, laporSelesai);

// ─── APPROVAL QUEUE ──────────────────────────────────────────────────────────
router.get("/approval", sekPerm, getApprovalQueue);
router.post("/approval", requireAnyPermission(["dashboard:read", "sekretaris:read", "kasubag:write", "pelaksana:write"]), submitApproval);
router.get("/approval/:id", sekPerm, getApprovalDetail);
router.post("/approval/:id/putuskan", sekPerm, putuskanApproval);
router.post("/approval/:id/teruskan-kadin", sekPerm, teruskankKaDin);
router.get("/approval/:id/riwayat-revisi", sekPerm, getRiwayatRevisi);

// ─── MONITOR BAWAHAN & PERINTAH ──────────────────────────────────────────────
router.get("/monitor/bawahan", sekPerm, getMonitorBawahan);
router.get("/monitor/bawahan/:userId", sekPerm, getMonitorBawahanDetail);
router.get("/monitor/overdue", sekPerm, getOverdueTasks);

router.get("/perintah", sekPerm, getPerintahKeBawahan);
router.post("/perintah", sekPerm, buatPerintah);
router.post("/perintah/:id/ingatkan", sekPerm, ingatkanBawahan);
router.post("/perintah/:id/eskalasi", sekPerm, eskalasiPerintah);

// ─── SCORECARD & SKP ─────────────────────────────────────────────────────────
router.get("/kinerja/bawahan", sekPerm, getScorecardBawahan);
router.get("/kinerja/bawahan/:userId", sekPerm, getScorecardDetail);
router.post("/skp/:userId", sekPerm, isiSkp);
router.get("/skp/:userId", sekPerm, getSkpHistory);
router.post("/skp/:userId/finalize", sekPerm, finalizeSkp);

// ─── KPI & BYPASS ────────────────────────────────────────────────────────────
router.get("/kpi/semua", sekPerm, getSemuaKpi);
router.get("/kpi/alert", sekPerm, getKpiAlert);
router.get("/bypass/list", sekPerm, getBypassList);
router.post("/bypass/:id/teguran", sekPerm, kirimTeguran);

// ─── KONSOLIDASI LAPORAN ─────────────────────────────────────────────────────
router.get("/konsolidasi", sekPerm, getKonsolidasi);
router.get("/konsolidasi/riwayat", sekPerm, getRiwayatKonsolidasi);
router.post("/konsolidasi/unit-submit", requireAnyPermission(["dashboard:read", "kepala_bidang:write", "uptd:write"]), unitSubmit);
router.post("/konsolidasi/generate", sekPerm, generateKonsolidasi);
router.post("/konsolidasi/:id/teruskan-kadin", sekPerm, teruskankKadinKonsolidasi);

// ─── PROGRAM PRIORITAS ───────────────────────────────────────────────────────
router.get("/sppg/status", sekPerm, getSppgStatus);
router.get("/tpid/data", sekPerm, getTpidData);

// ─── NOTIFIKASI ──────────────────────────────────────────────────────────────
router.get("/notifikasi", sekPerm, getNotifikasi);
router.put("/notifikasi/:id/baca", sekPerm, tandaiBaca);
router.put("/notifikasi/baca-semua", sekPerm, tandaiBacaSemua);

export default router;
