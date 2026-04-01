// Routes: Pelaksana — modul data lapangan (Ketersediaan + Distribusi)
import { Router } from "express";
import { protect } from "../middleware/auth.js";
import {
  postDataPangan,
  getDataPanganRiwayat,
  postDataKonsumsi,
  getDataKonsumsiRiwayat,
  getDikembalikanSaya,
  postUptdAdminTu,
  getUptdAdminTuRiwayat,
  postUptdSertifikasi,
  postUptdUjiLab,
  getUptdSertifikasiRiwayat,
  getUptdUjiLabRiwayat,
  postHargaPasar,
  getHargaPasarHariIni,
  getHargaPasarCoverage,
  getHargaPasarKemarin,
} from "../controllers/pelaksanaBidangController.js";

import spjSelfGuard from "../middleware/spjSelfGuard.js";
import {
  listTugasSaya,
  terimaTugas,
  mulaiTugas,
  submitHasil,
} from "../controllers/pelaksanaSekretariat/tugasController.js";
import {
  listSpjSaya,
  getSpjDetail,
  createSpj,
  updateSpj,
  submitKeBendahara,
  listSpjDikembalikan,
} from "../controllers/pelaksanaSekretariat/spjController.js";
import {
  getHariIni as getAbsensiHariIni,
  postAbsensi,
  getBulanIni as getAbsensiBulanIni,
} from "../controllers/pelaksanaSekretariat/absensiController.js";

const router = Router();

router.use(protect);

router.post("/data-pangan", postDataPangan);
router.get("/data-pangan/riwayat", getDataPanganRiwayat);

router.post("/data-konsumsi", postDataKonsumsi);
router.get("/data-konsumsi/riwayat", getDataKonsumsiRiwayat);

router.get("/dikembalikan", getDikembalikanSaya);

// Prompt 10: Pelaksana Sekretariat (tugas + absensi + SPJ)
router.get("/tugas", listTugasSaya);
router.post("/tugas/:id/terima", terimaTugas);
router.post("/tugas/:id/mulai", mulaiTugas);
router.post("/tugas/:id/submit", submitHasil);

router.get("/spj", listSpjSaya);
router.get("/spj/dikembalikan", listSpjDikembalikan);
router.get("/spj/:id", getSpjDetail);
router.post("/spj", spjSelfGuard, createSpj);
router.put("/spj/:id", spjSelfGuard, updateSpj);
router.post("/spj/:id/submit", spjSelfGuard, submitKeBendahara);

router.get("/absensi/hari-ini", getAbsensiHariIni);
router.get("/absensi/bulan-ini", getAbsensiBulanIni);
router.post("/absensi", postAbsensi);

// Prompt 23: Pelaksana UPTD (TU/Mutu/Teknis)
router.post("/uptd/tu/admin", postUptdAdminTu);
router.get("/uptd/tu/admin/riwayat", getUptdAdminTuRiwayat);
router.post("/uptd/mutu/sertifikasi", postUptdSertifikasi);
router.get("/uptd/mutu/sertifikasi/riwayat", getUptdSertifikasiRiwayat);
router.post("/uptd/teknis/uji-lab", postUptdUjiLab);
router.get("/uptd/teknis/uji-lab/riwayat", getUptdUjiLabRiwayat);

router.post("/harga-pasar", postHargaPasar);
router.get("/harga-pasar/hari-ini", getHargaPasarHariIni);
router.get("/harga-pasar/coverage", getHargaPasarCoverage);
router.get("/harga-pasar/kemarin", getHargaPasarKemarin);

export default router;
