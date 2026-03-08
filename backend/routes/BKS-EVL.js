// backend/routes/BKS-EVL.js

import express from "express";
import {
  getAllBksEvl,
  getBksEvlById,
  createBksEvl,
  updateBksEvl,
  deleteBksEvl,
  getBksEvlSummary,
} from "../controllers/BKS-EVL.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

// WAJIB sebelum "/:id"
router.get("/summary", getBksEvlSummary);

router.route("/").get(getAllBksEvl).post(createBksEvl);

router.route("/:id").get(getBksEvlById).put(updateBksEvl).delete(deleteBksEvl);

export default router;
