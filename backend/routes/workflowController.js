// =====================================================
// ROUTES: Workflowcontroller
// Base Path: /api/workflowcontroller
// Generated: 2026-03-19T23:39:38.364Z
// =====================================================

import express from "express";
import {
  list,
  create,
  getById,
  update,
  remove,
  transition,
} from "../controllers/workflowController.js";
// import { protect } from '../middleware/auth.js'; // Uncomment when auth is ready

const router = express.Router();

// All routes are protected (uncomment when auth is ready)
// router.use(protect);

router.route("/").get(list).post(create);

router.route("/:id").get(getById).put(update).delete(remove);

router.post("/:id/transition", transition);

export default router;
