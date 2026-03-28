// backend/routes/rekeningAnggaran.js
// Base: /api/rekening-anggaran + /api/spj (PPK actions)

import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { requireAnyPermission } from "../middleware/permissionCheck.js";
import {
  listRekeningAnggaran,
  verifikasiPPK,
  kembalikanPPK,
  terbitkanSPM,
  inputSP2D,
} from "../controllers/dashboardFungsionalKeuanganController.js";

const router = Router();
router.use(protect);

const keuPerm = requireAnyPermission([
  "dashboard:read",
  "fungsional_analis_keuangan:read",
  "fungsional_keuangan:read",
  "fungsional:read",
  "ppk:read",
  "sek-keu:read",
]);

// Rekening Anggaran
router.get("/rekening-anggaran", keuPerm, listRekeningAnggaran);

// SPJ PPK actions
router.put("/spj/:id/verifikasi-ppk", keuPerm, verifikasiPPK);
router.put("/spj/:id/kembalikan-ppk", keuPerm, kembalikanPPK);
router.post("/spj/:id/terbitkan-spm", keuPerm, terbitkanSPM);
router.put("/spj/:id/input-sp2d", keuPerm, inputSP2D);

export default router;
