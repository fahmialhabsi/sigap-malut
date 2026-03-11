import express from "express";
import taskController from "../controllers/taskController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Protect task workflow endpoints to ensure actor/context are available.
router.use(protect);
router.use("/", taskController);

export default router;
