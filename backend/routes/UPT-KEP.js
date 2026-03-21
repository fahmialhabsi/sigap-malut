import express from "express";
import {
  getAllUptKep,
  getUptKepById,
  createUptKep,
  updateUptKep,
  deleteUptKep,
} from "../controllers/UPT-KEP.js";
import { protect } from "../middleware/auth.js";
import { enforceUptdPilotAccess } from "../middleware/uptdPilotGuard.js";

const router = express.Router();

router.use(protect, enforceUptdPilotAccess);

router.route("/").get(getAllUptKep).post(createUptKep);

router
  .route("/:id")
  .get(getUptKepById)
  .put(updateUptKep)
  .delete(deleteUptKep);

export default router;
