// Routes: JF Bidang Ketersediaan
import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { confidentialSkpGuard } from '../middleware/confidentialSkpGuard.js';
import { blockDirectSubmitToKabid } from '../middleware/chainOfCommandGuard.js';
import {
  getTugasKabid,
  terimaTugasKabid,
  submitHasilKeKabid,
  getVerifikasiQueue,
  terimaVerifikasi,
  kembalikanVerifikasi,
  getTimPelaksana,
  assignTugasKePelaksana,
  getSkpPelaksana,
  inputSkpPelaksana,
  getAnalisaList,
  buatAnalisa
} from '../controllers/jfKetersediaanController.js';

const router = Router();

router.use(protect);

// Tugas dari Kepala Bidang
router.get('/tugas-kabid', getTugasKabid);
router.post('/tugas-kabid/:id/terima', terimaTugasKabid);
router.post('/tugas-kabid/:id/submit', submitHasilKeKabid);

// Verifikasi data dari Pelaksana
router.get('/verifikasi/masuk', getVerifikasiQueue);
router.post('/verifikasi/:id/terima', terimaVerifikasi);
router.post('/verifikasi/:id/kembalikan', kembalikanVerifikasi);

// Manajemen Tim Pelaksana
router.get('/tim', getTimPelaksana);
router.post('/tim/tugas', assignTugasKePelaksana);

// Analisa & Laporan
router.get('/analisa', getAnalisaList);
router.post('/analisa', buatAnalisa);

// SKP Pelaksana (CONFIDENTIAL — hanya JF penilai langsung)
router.get('/skp/pelaksana', confidentialSkpGuard, getSkpPelaksana);
router.post('/skp/pelaksana/:pelaksanaId', confidentialSkpGuard, inputSkpPelaksana);

export default router;
