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

// Simple in-memory rate limiter: max 60 requests per minute per IP
const requestCounts = new Map();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 60;

function rateLimit(req, res, next) {
  const key = req.ip || "unknown";
  const now = Date.now();
  const entry = requestCounts.get(key) || { count: 0, start: now };

  if (now - entry.start > WINDOW_MS) {
    entry.count = 1;
    entry.start = now;
  } else {
    entry.count += 1;
  }
  requestCounts.set(key, entry);

  if (entry.count > MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      message: "Terlalu banyak permintaan. Coba lagi nanti.",
    });
  }
  return next();
}

// All task routes require authentication + rate limiting
router.use(rateLimit);
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
