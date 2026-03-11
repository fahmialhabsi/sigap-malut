/**
 * backend/routes/tasks.js
 * Task Workflow routes for Sekretariat
 */
import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createTask,
  listTasks,
  getTask,
  assignTask,
  transitionTask,
} from "../controllers/taskController.js";

const router = express.Router();

// All task routes require authentication
router.use(protect);

// POST   /api/tasks          - create task
router.post("/", createTask);

// GET    /api/tasks          - list tasks (filtered by role/status)
router.get("/", listTasks);

// GET    /api/tasks/:id      - get task detail + logs + assignments
router.get("/:id", getTask);

// POST   /api/tasks/:id/assign     - assign task to role/user
router.post("/:id/assign", assignTask);

// POST   /api/tasks/:id/transition - change status
router.post("/:id/transition", transitionTask);

export default router;
