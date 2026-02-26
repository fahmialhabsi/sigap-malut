import express from "express";
import {
  moduleGenerate,
  listDynamicModules,
} from "../controllers/moduleGeneratorController.js";
import { protect } from "../middleware/auth.js";
import authorizeByRole from "../middleware/authorizeByRole.js";

const router = express.Router();

router.post(
  "/generate",
  protect,
  authorizeByRole("super_admin"),
  moduleGenerate,
);

router.get(
  "/list",
  protect,
  authorizeByRole("super_admin"),
  listDynamicModules,
);

export default router;
