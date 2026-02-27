import express from "express";
import { transition } from "../controllers/workflowController.js";
import authenticate from "../middleware/authenticate.js";

const router = express.Router();

// POST /api/workflows/:workflowName/transition (protected)
router.post("/:workflowName/transition", authenticate, transition);

export default router;
