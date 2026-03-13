import express from "express";
import { protect } from "../middleware/auth.js";
import {
  clearAuditTrail,
  listAuditTrail,
  writeAuditTrail,
} from "../services/workflowEngine.js";

const router = express.Router();

router.use(protect);

router.get("/", async (_req, res) => {
  try {
    const logs = await listAuditTrail();
    res.json(logs);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil audit trail",
      error: error.message,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const entry = await writeAuditTrail({
      user: { ...(req.body?.user || {}), ...(req.user || {}) },
      action: req.body?.action,
      detail: req.body?.detail,
    });
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal menyimpan audit trail",
      error: error.message,
    });
  }
});

router.delete("/", async (_req, res) => {
  try {
    await clearAuditTrail();
    res.json({ success: true, message: "Audit trail berhasil dihapus" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal menghapus audit trail",
      error: error.message,
    });
  }
});

export default router;
