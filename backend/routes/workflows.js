import express from "express";
import * as controller from "../controllers/workflowController.js";

import { protect } from "../middleware/auth.js";
import { requireWorkflowPermission } from "../middleware/workflowRbac.js";
import { chainOfCommandGuard, workflowValidation } from "../middleware/chainOfCommand.js";

const router = express.Router();

// Semua endpoint workflows

router.get(
  "/workflows",
  protect,
  requireWorkflowPermission("read"),
  controller.list,
);
router.post(
  "/workflows",
  protect,
  requireWorkflowPermission("create"),
  controller.create,
);
router.get(
  "/workflows/:id",
  protect,
  requireWorkflowPermission("read"),
  controller.getById,
);
router.put(
  "/workflows/:id",
  protect,
  requireWorkflowPermission("update"),
  controller.update,
);
router.delete(
  "/workflows/:id",
  protect,
  requireWorkflowPermission("delete"),
  controller.remove,
);
router.post(
  "/workflows/:id/transition",
  protect,
  chainOfCommandGuard,
  workflowValidation,
  requireWorkflowPermission("transition"),
  controller.transition,
);
router.get(
  "/workflows/:id/transitions",
  protect,
  requireWorkflowPermission("transitions.read"),
  controller.transitions,
);

export default router;
