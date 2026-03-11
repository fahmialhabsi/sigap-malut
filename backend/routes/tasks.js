import express from "express";
import taskController from "../controllers/taskController.js";
import { protect } from "../middleware/auth.js";
import limiter from "../middleware/rateLimiter.js";

const router = express.Router();

// Apply rate limiting to all task endpoints.
router.use(limiter);
// Protect task workflow endpoints to ensure actor/context are available.
router.use(protect);
router.use("/", taskController);

export default router;
