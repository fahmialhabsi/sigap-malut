import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { getLabWorkload, getUptdSummary } from "../controllers/uptdController.js";
import {
  assignTugasPelaksanaTu,
  getPelaksanaTuStaff,
} from "../controllers/uptdKasubagController.js";
import {
  assignTugasPelaksanaSeksi,
  getPelaksanaSeksiStaff,
} from "../controllers/uptdKasiController.js";

const router = Router();
router.use(protect);

router.get("/dashboard/lab-workload", getLabWorkload);
router.get("/dashboard/summary", getUptdSummary);

// Prompt 21a: Kasubag TU UPTD
router.get("/kasubag/tu-staff", getPelaksanaTuStaff);
router.post("/kasubag/assign-tu", assignTugasPelaksanaTu);

// Prompt 21b: Kasi Mutu / Kasi Teknis
router.get("/kasi/staff", getPelaksanaSeksiStaff);
router.post("/kasi/assign", assignTugasPelaksanaSeksi);

export default router;

