import express from "express";
import { protect } from "../middleware/auth.js";
import {
  closeCoordination,
  createCoordination,
  listCoordinationInbox,
  listCoordinationOutbox,
  respondCoordination,
} from "../controllers/coordinationController.js";
import {
  createHorizontalCoordination,
  listHorizontalByThread,
  respondHorizontalCoordination,
  updateHorizontalCoordinationStatus,
} from "../controllers/horizontalThreadCoordinationController.js";
import {
  getHorizontalDashboardExecutive,
  getHorizontalDashboardKabid,
  getHorizontalDashboardSekretaris,
  getHorizontalDashboardUptd,
} from "../controllers/horizontalCoordinationDashboardController.js";

const router = express.Router();

router.use(protect);

router.get("/horizontal/dashboard/sekretaris", getHorizontalDashboardSekretaris);
router.get("/horizontal/dashboard/kabid", getHorizontalDashboardKabid);
router.get("/horizontal/dashboard/uptd", getHorizontalDashboardUptd);
router.get("/horizontal/dashboard/executive", getHorizontalDashboardExecutive);

router.get("/horizontal/thread/:threadId", listHorizontalByThread);
router.post("/horizontal", createHorizontalCoordination);
router.patch("/horizontal/:id/status", updateHorizontalCoordinationStatus);
router.patch("/horizontal/:id/respond", respondHorizontalCoordination);

router.get("/inbox", listCoordinationInbox);
router.get("/outbox", listCoordinationOutbox);
router.post("/", createCoordination);
router.post("/:id/respond", respondCoordination);
router.post("/:id/close", closeCoordination);

export default router;
