import express from "express";
import { sekretarisGuard } from "../../middleware/sekretarisGuard.js";
import {
  getKinerjaBawahanAvg,
  listKinerjaBawahan,
} from "../../controllers/sekretaris/kinerjaController.js";

const router = express.Router();
router.use(sekretarisGuard);

router.get("/bawahan/avg", getKinerjaBawahanAvg);
router.get("/bawahan", listKinerjaBawahan);

export default router;

