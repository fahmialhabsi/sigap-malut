import express from "express";
import {
  getApprovalQueue,
  getApprovalDetail,
  putuskanApproval,
  teruskanKeKadin,
} from "../../controllers/sekretaris/approvalQueueController.js";
import { sekretarisGuard } from "../../middleware/sekretarisGuard.js";

const router = express.Router();

router.use(sekretarisGuard);

router.get("/", getApprovalQueue);
router.get("/:id", getApprovalDetail);
router.post("/:id/putuskan", putuskanApproval);
router.post("/:id/teruskan-kadin", teruskanKeKadin);

export default router;
