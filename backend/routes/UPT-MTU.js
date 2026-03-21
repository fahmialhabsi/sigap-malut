import express from "express";
import {
  getAllUptMtu,
  getUptMtuById,
  createUptMtu,
  updateUptMtu,
  deleteUptMtu,
} from "../controllers/UPT-MTU.js";
import { protect } from "../middleware/auth.js";
import { enforceUptdPilotAccess } from "../middleware/uptdPilotGuard.js";

const router = express.Router();

router.use(protect, enforceUptdPilotAccess);

router.route("/").get(getAllUptMtu).post(createUptMtu);

router
  .route("/:id")
  .get(getUptMtuById)
  .put(updateUptMtu)
  .delete(deleteUptMtu);

export default router;
