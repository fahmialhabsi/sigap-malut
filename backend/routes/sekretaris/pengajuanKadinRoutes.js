import express from "express";
import { protect } from "../../middleware/auth.js";
import { sekretarisGuard } from "../../middleware/sekretarisGuard.js";
import {
  listPengajuanKadinGateway,
  mulaiReviewPengajuanKadin,
  teruskanPengajuanKeKadin,
  kembalikanPengajuanKePengaju,
} from "../../controllers/sekretaris/pengajuanKadinGatewayController.js";

const router = express.Router();

router.use(protect, sekretarisGuard);

router.get("/", listPengajuanKadinGateway);
router.post("/:id/mulai-review", mulaiReviewPengajuanKadin);
router.post("/:id/teruskan-kadin", teruskanPengajuanKeKadin);
router.post("/:id/kembalikan", kembalikanPengajuanKePengaju);

export default router;
