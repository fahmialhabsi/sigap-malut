import express from "express";
import { protect } from "../middleware/auth.js";
import {
  listThreads,
  getOrCreateThread,
  postMessage,
} from "../controllers/clarificationController.js";

const router = express.Router();
router.use(protect);

router.get("/threads", listThreads);
router.post("/threads", getOrCreateThread);
router.post("/threads/:id/messages", postMessage);

export default router;
