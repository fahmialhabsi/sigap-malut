import express from "express";
import {
  getInboxKadin,
  getInboxKadinDetail,
  konfirmasiTerima,
  distribusiTask,
  laporSelesai,
} from "../../controllers/sekretaris/inboxKadinController.js";
import { sekretarisGuard } from "../../middleware/sekretarisGuard.js";

const router = express.Router();

// protect all routes
router.use(sekretarisGuard);

// routes
router.get("/", getInboxKadin);
router.get("/:id", getInboxKadinDetail);
router.post("/:id/konfirmasi", konfirmasiTerima);
router.post("/:id/distribusi", distribusiTask);
router.post("/:id/lapor-selesai", laporSelesai);

export default router;
