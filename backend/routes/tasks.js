// backend/routes/tasks.js
import express from "express";
import {
  createTask,
  listTasks,
  getTask,
  assignTask,
  acceptTask,
  submitTask,
  verifyTask,
  reviewTask,
  getTaskAudit,
  sekretariatDashboard,
} from "../controllers/taskController.js";

const router = express.Router();

// Task CRUD
router.post("/tasks", createTask);
router.get("/tasks", listTasks);
router.get("/tasks/:id", getTask);

// Task lifecycle transitions
router.post("/tasks/:id/assign", assignTask);
router.post("/tasks/:id/accept", acceptTask);
router.post("/tasks/:id/submit", submitTask);
router.post("/tasks/:id/verify", verifyTask);
router.post("/tasks/:id/review", reviewTask);

// Audit trail for a specific task
router.get("/tasks/:id/audit", getTaskAudit);

// Sekretariat dashboard summary
router.get("/dashboard/sekretariat", sekretariatDashboard);

export default router;
