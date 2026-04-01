import express from "express";
import { sekretarisGuard } from "../../middleware/sekretarisGuard.js";
import {
  listPerintahTimeline,
  createPerintahTurunan,
} from "../../controllers/sekretaris/perintahController.js";

const router = express.Router();
router.use(sekretarisGuard);

// Timeline semua perintah Sekretaris ke bawahan (termasuk turunan dari KaDin)
router.get("/timeline", listPerintahTimeline);

// Buat perintah turunan dari task KaDin → assign ke bawahan
router.post("/turunan", createPerintahTurunan);

export default router;

