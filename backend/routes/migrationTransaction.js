import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/roleCheck.js";
import { migrationAsync } from "../utils/migrationResponse.js";
import {
  previewTransactionUpdatesController,
  applyToTransactionsController,
  rollbackTransactionApplyController,
} from "../controllers/migrationTransactionController.js";

const router = Router();

router.post(
  "/preview-transaction-updates",
  protect,
  authorize("super_admin"),
  migrationAsync(previewTransactionUpdatesController),
);
router.post(
  "/apply-to-transactions",
  protect,
  authorize("super_admin"),
  migrationAsync(applyToTransactionsController),
);
router.post(
  "/rollback-transaction-apply",
  protect,
  authorize("super_admin"),
  migrationAsync(rollbackTransactionApplyController),
);

export default router;
