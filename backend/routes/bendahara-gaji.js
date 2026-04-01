import express from "express";
import { protect } from "../middleware/auth.js";
import bendaharaGajiGuard from "../middleware/bendaharaGajiGuard.js";
import * as dash from "../controllers/bendaharaGaji/dashboardController.js";
import * as dg from "../controllers/bendaharaGaji/daftarGajiController.js";
import * as inbox from "../controllers/jfKeuangan/inboxSekretarisController.js";

const router = express.Router();
router.use(protect, bendaharaGajiGuard);

router.get("/dashboard/summary", dash.getSummary);

router.get("/inbox-sekretaris", inbox.listInboxSekretaris);
router.post("/inbox-sekretaris/:id/konfirmasi", inbox.konfirmasiTerima);

router.get("/daftar-gaji", dg.listDaftarGaji);
router.get("/daftar-gaji/bulan-ini", dg.getBulanIni);
router.post("/daftar-gaji/buat-bulan-ini", dg.buatBulanIni);
router.put("/daftar-gaji/:id", dg.updateDraft);
router.post("/daftar-gaji/:id/submit-ppk", dg.submitKePpk);

router.get("/dikembalikan", dg.listDikembalikan);

export default router;

