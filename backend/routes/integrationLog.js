import express from "express";
import { getIntegrationLogs } from "../controllers/integrationLogController.js";

const router = express.Router();

router.get("/", getIntegrationLogs);

export default router;
