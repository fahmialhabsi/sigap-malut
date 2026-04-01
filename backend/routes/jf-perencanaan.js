import express from "express";
import { protect } from "../middleware/auth.js";
import jfPerencanaanGuard from "../middleware/jfPerencanaanGuard.js";
import * as dashboard from "../controllers/jfPerencanaan/dashboardController.js";
import * as inbox from "../controllers/jfPerencanaan/inboxSekretarisController.js";
import * as analisa from "../controllers/jfPerencanaan/analisaController.js";

const router = express.Router();

router.use(protect, jfPerencanaanGuard);

router.get("/dashboard/summary", dashboard.getSummary);

router.get("/inbox-sekretaris", inbox.listInboxSekretaris);
router.post("/inbox-sekretaris/:id/konfirmasi", inbox.konfirmasiTerima);

router.get("/analisa/dikembalikan", analisa.listDikembalikan);
router.post("/analisa", analisa.createAnalisa);
router.get("/analisa", analisa.listAnalisaSaya);
router.get("/analisa/:id", analisa.getAnalisaById);
router.put("/analisa/:id", analisa.updateDraft);
router.post("/analisa/:id/submit", analisa.submitAnalisa);
router.post("/analisa/:id/revisi", analisa.submitRevisi);

export default router;

