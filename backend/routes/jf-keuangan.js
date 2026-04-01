import express from "express";
import { protect } from "../middleware/auth.js";
import jfKeuanganGuard from "../middleware/jfKeuanganGuard.js";
import * as dashboard from "../controllers/jfKeuangan/dashboardController.js";
import * as inbox from "../controllers/jfKeuangan/inboxSekretarisController.js";
import * as ppk from "../controllers/jfKeuangan/ppkQueueController.js";

const router = express.Router();

router.use(protect, jfKeuanganGuard);

router.get("/dashboard/summary", dashboard.getSummary);

router.get("/inbox-sekretaris", inbox.listInboxSekretaris);
router.post("/inbox-sekretaris/:id/konfirmasi", inbox.konfirmasiTerima);

router.get("/ppk-queue", ppk.listQueue);
router.get("/ppk-queue/:spjId", ppk.getDetail);
router.post("/ppk-queue/:spjId/terima", ppk.terima);
router.post("/ppk-queue/:spjId/kembalikan", ppk.kembalikan);
router.post("/ppk-queue/:spjId/tolak", ppk.tolak);

export default router;

