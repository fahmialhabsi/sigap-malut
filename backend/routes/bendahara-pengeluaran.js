import express from "express";
import { protect } from "../middleware/auth.js";
import bendaharaPengeluaranGuard from "../middleware/bendaharaPengeluaranGuard.js";
import * as spj from "../controllers/bendaharaPengeluaran/spjController.js";
import * as inbox from "../controllers/jfKeuangan/inboxSekretarisController.js";
import * as dash from "../controllers/bendaharaPengeluaran/dashboardController.js";

const router = express.Router();
router.use(protect, bendaharaPengeluaranGuard);

// Inbox Sekretaris (reuse generic task assignment logic)
router.get("/dashboard/summary", dash.getSummary);
router.get("/inbox-sekretaris", inbox.listInboxSekretaris);
router.post("/inbox-sekretaris/:id/konfirmasi", inbox.konfirmasiTerima);

// SPJ workflow (admin verification only)
router.get("/spj/masuk", spj.listSpjMasuk);
router.post("/spj/:id/verifikasi-ok", spj.verifikasiOk);
router.post("/spj/:id/kembalikan", spj.kembalikanKePelaksana);
router.post("/spj/:id/kirim-ppk", spj.kirimKePpk);

router.get("/spj/dikembalikan-ppk", spj.listDikembalikanPpk);
router.get("/spj/siap-dibayar", spj.listSiapDibayar);
router.post("/spj/:id/bayar", spj.prosesPembayaran);

export default router;

