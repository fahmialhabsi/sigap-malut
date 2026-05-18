// Routes: Kepala Bidang Distribusi & Cadangan Pangan
import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { requireKabidDistribusi, blockSkpPelaksanaForKabid } from "../middleware/kabidDistribusiGuard.js";
import { requireHargaPanganDataAdmin } from "../middleware/hargaPanganDataAdminGuard.js";
import { requireJFBeforeKabid, requireKabidBeforeSekretaris } from "../middleware/chainOfCommandGuard.js";
import {
  getDashboardSummary,
  getHeroInflasi,
  getAlertHargaKritis,
  adminAmendHargaPangan,
  getCppdStatus,
  getApprovalQueue,
  setujuiDokumenJF,
  kembalikanDokumenKJF,
  getTimJF,
  assignTugasKeJF,
  getSkpJF,
  generateLaporanMendagri,
  getLaporanKeSekretarisStatus,
} from "../controllers/kabidDistribusiController.js";

const router = Router();

router.use(protect);
router.use(requireKabidDistribusi);

router.get("/dashboard/summary", getDashboardSummary);
router.get("/dashboard/inflasi", getHeroInflasi);
router.get("/inflasi/current", getHeroInflasi);

router.get("/alert-harga-kritis", getAlertHargaKritis);
/** Koreksi data terverifikasi: super_admin / kepala_dinas saja + audit log */
router.put("/harga-pangan/:id", requireHargaPanganDataAdmin, adminAmendHargaPangan);
router.get("/cppd", getCppdStatus);

// Approval Queue — requireJFBeforeKabid enforces governance (DB-backed, ZERO TRUST)
router.get("/approval-queue", getApprovalQueue);
router.post("/approval-queue/:id/setujui", requireJFBeforeKabid, setujuiDokumenJF);
router.post("/approval-queue/:id/kembalikan", requireJFBeforeKabid, kembalikanDokumenKJF);

router.get("/tim", getTimJF);
router.post("/tugas", assignTugasKeJF);

router.get("/skp/jf", getSkpJF);
router.get("/skp/pelaksana", blockSkpPelaksanaForKabid, (req, res) => {
  res.status(403).json({ error: "forbidden", code: "CONFIDENTIAL_SKP_PELAKSANA" });
});

router.post("/inflasi/generate-mendagri", generateLaporanMendagri);
router.post("/laporan/mendagri", generateLaporanMendagri);

router.get("/laporan-ke-sekretaris/status", getLaporanKeSekretarisStatus);

export default router;
