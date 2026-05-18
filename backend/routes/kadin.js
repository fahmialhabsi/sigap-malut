import express from "express";
import { protect } from "../middleware/auth.js";
import kadinGuard from "../middleware/kadinGuard.js";
import { requireSekretarisBeforeKadin, requireKadinBeforeGubernur } from "../middleware/chainOfCommandGuard.js";

import { getSummary, getKadinCockpit } from "../controllers/kadin/dashboardController.js";
import {
  listInboxGubernur,
  getInboxGubernurDetail,
  konfirmasiTerimaInstruksi,
  laporSelesaiInstruksi,
} from "../controllers/kadin/inboxGubernurController.js";
import { createPerintah, listPerintah, getPerintahDetail } from "../controllers/kadin/perintahController.js";
import { listApproval, getApprovalDetail, putuskanApproval } from "../controllers/kadin/approvalController.js";
import { getKinerjaBawahan } from "../controllers/kadin/kinerjaBawahanController.js";
import {
  createPengajuanKeGubernur,
  listPengajuanKeGubernurSaya,
} from "../controllers/kadin/pengajuanKeGubernurController.js";
import taskController from "../controllers/taskController.js";

const router = express.Router();
router.use(protect, kadinGuard);

// Dashboard
router.get("/dashboard/summary", getSummary);
router.get("/dashboard/cockpit", getKadinCockpit);

// Inbox instruksi dari Gubernur
router.get("/inbox-gubernur", listInboxGubernur);
router.get("/inbox-gubernur/:id", getInboxGubernurDetail);
router.post("/inbox-gubernur/:id/konfirmasi", konfirmasiTerimaInstruksi);
router.post("/inbox-gubernur/:id/lapor-selesai", laporSelesaiInstruksi);

// Perintah Kepala Dinas ke 5 bawahan langsung
router.post("/perintah", createPerintah);
router.get("/perintah", listPerintah);
router.get("/perintah/:id", getPerintahDetail);

// Approval queue (hanya yang sudah lolos gateway Sekretaris); PIN hanya untuk jenis strategis di controller
router.get("/approval", listApproval);
router.get("/approval/:id", getApprovalDetail);
router.post("/approval/:id/putuskan", putuskanApproval);

// Task governance — Kadis bisa eskalasikan task ke Gubernur (v2.8)
// requireKadinBeforeGubernur ensures task is in forwarded_to_kadin before escalation
router.post("/tasks/:id/escalate-to-governor", requireKadinBeforeGubernur, (req, res, next) => {
  req.body._action_override = "escalate_to_governor";
  next();
}, taskController);

// Monitoring kinerja 5 bawahan langsung
router.get("/kinerja/bawahan", getKinerjaBawahan);

// Pengajuan strategis ke Gubernur (alur lengkap Kadis → Gubernur)
router.get("/pengajuan-gubernur", listPengajuanKeGubernurSaya);
router.post("/pengajuan-gubernur", createPengajuanKeGubernur);

export default router;

