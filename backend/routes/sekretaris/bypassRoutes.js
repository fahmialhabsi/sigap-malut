import express from "express";
import { sekretarisGuard } from "../../middleware/sekretarisGuard.js";
import { listBypassSekretaris } from "../../controllers/sekretaris/bypassController.js";

const router = express.Router();
router.use(sekretarisGuard);

router.get("/list", listBypassSekretaris);

export default router;

