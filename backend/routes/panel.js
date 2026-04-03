import express from "express";
import { protect } from "../middleware/auth.js";
import { listTanggapanDariBawahan } from "../controllers/tanggapanPanelController.js";

const router = express.Router();
router.use(protect);

router.get("/tanggapan-dari-bawahan", listTanggapanDariBawahan);

export default router;
