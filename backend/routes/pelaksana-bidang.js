// Routes: Pelaksana — modul data lapangan (Ketersediaan + Distribusi)
import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  postDataPangan,
  getDataPanganRiwayat,
  postHargaPasar,
  getHargaPasarHariIni,
  getHargaPasarCoverage,
  getHargaPasarKemarin,
} from "../controllers/pelaksanaBidangController.js";

const router = Router();

router.use(protect);

router.post("/data-pangan", postDataPangan);
router.get("/data-pangan/riwayat", getDataPanganRiwayat);

router.post("/harga-pasar", postHargaPasar);
router.get("/harga-pasar/hari-ini", getHargaPasarHariIni);
router.get("/harga-pasar/coverage", getHargaPasarCoverage);
router.get("/harga-pasar/kemarin", getHargaPasarKemarin);

export default router;
