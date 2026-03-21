import express from "express";
import {
  triggerMasterDataSync,
  syncOnce,
  getSyncStats,
} from "../controllers/masterDataSyncController.js";

const router = express.Router();

router.post("/trigger", triggerMasterDataSync);
router.post("/sync-once", syncOnce);
router.get("/stats", getSyncStats);

export default router;
