import express from "express";
import {
  getAllUptIns,
  getUptInsById,
  createUptIns,
  updateUptIns,
  deleteUptIns,
} from "../controllers/UPT-INS.js";
import { protect } from "../middleware/auth.js";
import { enforceUptdPilotAccess } from "../middleware/uptdPilotGuard.js";

const router = express.Router();

router.use(protect, enforceUptdPilotAccess);

router.route("/").get(getAllUptIns).post(createUptIns);

router
  .route("/:id")
  .get(getUptInsById)
  .put(updateUptIns)
  .delete(deleteUptIns);

export default router;
