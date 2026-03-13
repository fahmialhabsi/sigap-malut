import express from "express";
import { protect } from "../middleware/auth.js";
import { hasPermission, resolveRoleCode } from "../middleware/rbacMiddleware.js";
import {
  clearWorkflowStatus,
  listWorkflowStatus,
  trackWorkflowStatus,
} from "../services/workflowEngine.js";

const router = express.Router();

router.use(protect);

async function ensureWorkflowUpdatePermission(req, res, next) {
  try {
    const moduleKey = String(req.body?.modulId || "")
      .trim()
      .toLowerCase();

    if (!moduleKey) {
      return res.status(400).json({
        success: false,
        message: "modulId wajib diisi",
      });
    }

    const roleCode = await resolveRoleCode(req.user);
    if (!roleCode) {
      return res.status(403).json({
        success: false,
        message: "Role tidak ditemukan untuk user ini",
      });
    }

    const allowed = await hasPermission(roleCode, "update", moduleKey);
    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: `Permission 'update' tidak dimiliki role '${roleCode}' untuk modul '${moduleKey}'`,
      });
    }

    req.user.role = roleCode;
    req.user.role_code = roleCode;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal melakukan validasi permission workflow",
      error: error.message,
    });
  }
}

router.get("/", async (_req, res) => {
  try {
    const logs = await listWorkflowStatus();
    res.json(logs);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil workflow status",
      error: error.message,
    });
  }
});

router.post("/", ensureWorkflowUpdatePermission, async (req, res) => {
  try {
    const entry = await trackWorkflowStatus({
      user: { ...(req.body?.user || {}), ...(req.user || {}) },
      modulId: req.body?.modulId,
      dataId: req.body?.dataId,
      status: req.body?.status,
      detail: req.body?.detail,
    });
    res.status(201).json(entry);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal menyimpan workflow status",
      error: error.message,
    });
  }
});

router.delete("/", async (_req, res) => {
  try {
    await clearWorkflowStatus();
    res.json({
      success: true,
      message: "Workflow status log berhasil dihapus",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal menghapus workflow status log",
      error: error.message,
    });
  }
});

export default router;
