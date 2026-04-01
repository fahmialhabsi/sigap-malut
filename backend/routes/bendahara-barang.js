import express from "express";
import { protect } from "../middleware/auth.js";
import bendaharaBarangGuard from "../middleware/bendaharaBarangGuard.js";
import * as dash from "../controllers/bendaharaBarang/dashboardController.js";
import * as aset from "../controllers/bendaharaBarang/asetController.js";
import * as penerimaan from "../controllers/bendaharaBarang/penerimaanController.js";
import * as pemeliharaan from "../controllers/bendaharaBarang/pemeliharaanController.js";
import * as kerusakan from "../controllers/bendaharaBarang/kerusakanController.js";
import * as inbox from "../controllers/jfKeuangan/inboxSekretarisController.js";

const router = express.Router();
router.use(protect, bendaharaBarangGuard);

router.get("/dashboard/summary", dash.getSummary);

router.get("/inbox-sekretaris", inbox.listInboxSekretaris);
router.post("/inbox-sekretaris/:id/konfirmasi", inbox.konfirmasiTerima);

router.get("/aset/summary", aset.getSummary);
router.get("/aset/kondisi-kritis", aset.listKondisiKritis);

router.get("/penerimaan/pending", penerimaan.listPending);
router.get("/penerimaan/dikembalikan-ppk", penerimaan.listDikembalikanPpk);

router.get("/pemeliharaan/mendatang-30hari", pemeliharaan.listMendatang30Hari);

router.get("/kerusakan/masuk", kerusakan.listMasuk);

export default router;

