import express from "express";
import {
  getAllUptAdm,
  getUptAdmById,
  createUptAdm,
  updateUptAdm,
  deleteUptAdm,
} from "../controllers/UPT-ADM.js";
import { protect } from "../middleware/auth.js";
import { enforceUptdPilotAccess } from "../middleware/uptdPilotGuard.js";

const router = express.Router();

router.use(protect, enforceUptdPilotAccess);

router.route("/").get(getAllUptAdm).post(createUptAdm);

router
  .route("/:id")
  .get(getUptAdmById)
  .put(updateUptAdm)
  .delete(deleteUptAdm);

export default router;
