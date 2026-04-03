import express from "express";
import { protect } from "../../middleware/auth.js";
import approvalQueueRoutes from "./approvalQueueRoutes.js";
import dashboardRoutes from "./dashboardRoutes.js";
import inboxKadinRoutes from "./inboxKadinRoutes.js";
import perintahRoutes from "./perintahRoutes.js";
import bypassRoutes from "./bypassRoutes.js";
import kinerjaRoutes from "./kinerjaRoutes.js";
import konsolidasiRoutes from "./konsolidasiRoutes.js";
import pengajuanKadinRoutes from "./pengajuanKadinRoutes.js";

const router = express.Router();

// Semua route Sekretaris butuh token valid agar req.user tersedia
router.use(protect);

router.use("/approval", approvalQueueRoutes);
router.use("/pengajuan-kadin", pengajuanKadinRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/inbox-kadin", inboxKadinRoutes);
router.use("/perintah", perintahRoutes);
router.use("/bypass", bypassRoutes);
router.use("/kinerja", kinerjaRoutes);
router.use("/konsolidasi", konsolidasiRoutes);

export default router;
