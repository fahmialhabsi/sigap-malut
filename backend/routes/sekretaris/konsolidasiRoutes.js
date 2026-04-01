import express from "express";
import { sekretarisGuard } from "../../middleware/sekretarisGuard.js";
import {
  getKonsolidasiStatus,
  ensureKonsolidasiRow,
} from "../../controllers/sekretaris/konsolidasiController.js";

const router = express.Router();
router.use(sekretarisGuard);

router.get("/", getKonsolidasiStatus);
router.post("/ensure", ensureKonsolidasiRow);

export default router;

