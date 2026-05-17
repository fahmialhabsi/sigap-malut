import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/roleCheck.js";
import { migrationAsync } from "../utils/migrationResponse.js";
import {
  getMasterPrograms,
  getMasterKegiatan,
  getMasterSubKegiatan,
  getMasterIndikator,
  postRunAutoMappingLite,
} from "../controllers/migrationMasterController.js";

const router = Router();

router.get("/master/programs", protect, authorize("super_admin"), migrationAsync(getMasterPrograms));
router.get("/master/kegiatan", protect, authorize("super_admin"), migrationAsync(getMasterKegiatan));
router.get("/master/sub-kegiatan", protect, authorize("super_admin"), migrationAsync(getMasterSubKegiatan));
router.get("/master/indikator", protect, authorize("super_admin"), migrationAsync(getMasterIndikator));
router.post(
  "/run-auto-mapping-lite",
  protect,
  authorize("super_admin"),
  migrationAsync(postRunAutoMappingLite),
);

export default router;
