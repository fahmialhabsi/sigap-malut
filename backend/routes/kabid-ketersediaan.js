// Routes: Kepala Bidang Ketersediaan
import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { requireKabidKetersediaan, blockSkpPelaksanaForKabid } from '../middleware/kabidKetersediaanGuard.js';
import {
  getDashboardSummary,
  getEwsPanel,
  kirimEwsKeKadin,
  getLaporanKeSekretarisStatus,
  getApprovalQueue,
  setujuiDokumenJF,
  kembalikanDokumenKJF,
  getTimJF,
  assignTugasKeJF,
  getProduksiPangan,
  getStokPangan,
  getNeracaPangan,
  getKerawananPangan,
  getSkpJF
} from '../controllers/kabidKetersediaanController.js';

const router = Router();

router.use(protect);
router.use(requireKabidKetersediaan);

// Dashboard
router.get('/dashboard/summary', getDashboardSummary);
router.get('/dashboard/ews', getEwsPanel);
router.post('/ews/kirim-kadin', kirimEwsKeKadin);
router.get("/laporan-ke-sekretaris/status", getLaporanKeSekretarisStatus);

// Approval Queue
router.get('/approval-queue', getApprovalQueue);
router.post('/approval-queue/:id/setujui', setujuiDokumenJF);
router.post('/approval-queue/:id/kembalikan', kembalikanDokumenKJF);

// Tim JF
router.get('/tim', getTimJF);
router.post('/tugas', assignTugasKeJF);

// Data Teknis
router.get('/produksi-pangan', getProduksiPangan);
router.get('/stok-pangan', getStokPangan);
router.get('/neraca-pangan/:periode', getNeracaPangan);
router.get('/kerawanan-pangan', getKerawananPangan);

// SKP — Kepala Bidang DIBLOKIR dari nilai Pelaksana
router.get('/skp/jf', getSkpJF);
router.get('/skp/pelaksana', blockSkpPelaksanaForKabid, (req, res) => {
  // Middleware blockSkpPelaksanaForKabid akan menghentikan request dengan 403
  res.status(403).json({ error: 'forbidden', code: 'CONFIDENTIAL_SKP_PELAKSANA' });
});

export default router;
