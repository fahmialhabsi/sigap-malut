import express from "express";
import {
  getAllUptKeu,
  getUptKeuById,
  createUptKeu,
  updateUptKeu,
  deleteUptKeu,
} from "../controllers/UPT-KEU.js";
import { protect } from "../middleware/auth.js";
import { enforceUptdPilotAccess } from "../middleware/uptdPilotGuard.js";

const router = express.Router();

router.use(protect, enforceUptdPilotAccess);

router.route("/").get(getAllUptKeu).post(createUptKeu);

router
  .route("/:id")
  .get(getUptKeuById)
  .put(updateUptKeu)
  .delete(deleteUptKeu);

export default router;
