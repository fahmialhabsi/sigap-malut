import express from "express";
import rateLimit from "express-rate-limit";
import {
  downloadHargaPanganCsv,
  getHargaPanganTrend,
  getInflasiTrend,
  getPublicCppdSummary,
  getPublicSummary,
  listPublicDatasets,
} from "../controllers/publicController.js";

const router = express.Router();

// Public rate-limit (baseline). Perketat saat go-live jika dibutuhkan.
router.use(
  rateLimit({
    windowMs: 60 * 1000,
    limit: 120,
    standardHeaders: "draft-7",
    legacyHeaders: false,
  }),
);

router.get("/summary", getPublicSummary);
router.get("/cppd/summary", getPublicCppdSummary);
router.get("/datasets", listPublicDatasets);
router.get("/inflasi/trend", getInflasiTrend);
router.get("/harga/trend", getHargaPanganTrend);
router.get("/datasets/harga-pangan.csv", downloadHargaPanganCsv);

export default router;

