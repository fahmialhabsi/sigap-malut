import express from "express";
import {
  moduleGenerate,
  listDynamicModules,
} from "../controllers/moduleGeneratorController.js";
import { protect } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbacMiddleware.js";

const router = express.Router();

router.post(
  "/generate",
  protect,
  requireRole("super_admin"),
  moduleGenerate,
);

router.get(
  "/list",
  protect,
  requireRole("super_admin"),
  listDynamicModules,
);

export default router;
