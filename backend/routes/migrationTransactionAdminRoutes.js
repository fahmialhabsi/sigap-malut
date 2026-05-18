import { Router } from "express";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/roleCheck.js";
import { migrationAsync } from "../utils/migrationResponse.js";
import {
  getRegulasiVersiList,
  getPreviewTransactionUpdates,
  getTransactionBatches,
  getTransactionBatchDetailController,
  getUnmappedTransactions,
  getGovernanceReportController,
} from "../controllers/migrationTransactionAdminController.js";

const router = Router();

router.get("/regulasi-versi", protect, authorize("super_admin"), migrationAsync(getRegulasiVersiList));
router.get(
  "/preview-transaction-updates",
  protect,
  authorize("super_admin"),
  migrationAsync(getPreviewTransactionUpdates),
);
router.get("/transaction-batches", protect, authorize("super_admin"), migrationAsync(getTransactionBatches));
router.get(
  "/transaction-batch-detail",
  protect,
  authorize("super_admin"),
  migrationAsync(getTransactionBatchDetailController),
);
router.get(
  "/unmapped-transactions",
  protect,
  authorize("super_admin"),
  migrationAsync(getUnmappedTransactions),
);
router.get(
  "/governance-report",
  protect,
  authorize("super_admin"),
  migrationAsync(getGovernanceReportController),
);

export default router;
