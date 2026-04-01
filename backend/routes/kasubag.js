import express from "express";
import { protect } from "../middleware/auth.js";
import kasubagGuard from "../middleware/kasubagGuard.js";
import { getKasubagDashboardSummary } from "../controllers/kasubag/dashboardController.js";
import { listInboxSekretaris } from "../controllers/kasubag/inboxSekretarisController.js";
import { listVerifikasiQueue } from "../controllers/kasubag/verifikasiQueueController.js";
import { kembalikanKePelaksana, verifikasiOk } from "../controllers/kasubag/verifikasiQueueController.js";
import { getTimSayaKanban } from "../controllers/kasubag/timController.js";

const router = express.Router();

router.use(protect);
router.use(kasubagGuard);

router.get("/dashboard/summary", getKasubagDashboardSummary);
router.get("/inbox-sekretaris", listInboxSekretaris);
router.get("/verifikasi", listVerifikasiQueue);
router.post("/verifikasi/:id/kembalikan", kembalikanKePelaksana);
router.post("/verifikasi/:id/ok", verifikasiOk);
router.get("/tim/kanban", getTimSayaKanban);

export default router;

