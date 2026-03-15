import express from "express";
import { protect } from "../middleware/auth.js";
import {
  hasPermission,
  resolveRoleCode,
} from "../middleware/rbacMiddleware.js";
import {
  clearApprovals,
  listApprovals,
  submitApproval,
  updateApproval,
} from "../services/workflowEngine.js";

const router = express.Router();

router.use(protect);

function requireModulePermission(permission, moduleIdResolver) {
  return async (req, res, next) => {
    try {
      const moduleIdRaw = moduleIdResolver(req);
      const moduleKey = String(moduleIdRaw || "")
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

      const allowed = await hasPermission(roleCode, permission, moduleKey);
      if (!allowed) {
        return res.status(403).json({
          success: false,
          message: `Permission '${permission}' tidak dimiliki role '${roleCode}' untuk modul '${moduleKey}'`,
        });
      }

      req.user.role = roleCode;
      req.user.role_code = roleCode;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Gagal melakukan validasi permission modul",
        error: error.message,
      });
    }
  };
}

router.get("/", async (_req, res) => {
  try {
    const approvals = await listApprovals();
    res.json(approvals);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil log approval",
      error: error.message,
    });
  }
});

router.post(
  "/",
  requireModulePermission("submit", (req) => req.body?.modulId),
  async (req, res) => {
    try {
      const entry = await submitApproval({
        user: { ...(req.body?.user || {}), ...(req.user || {}) },
        modulId: req.body?.modulId,
        dataId: req.body?.dataId,
        detail: req.body?.detail,
      });
      res.status(201).json(entry);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Gagal menyimpan approval",
        error: error.message,
      });
    }
  },
);

router.put(
  "/:modulId/:dataId",
  requireModulePermission("approve", (req) => req.params.modulId),
  async (req, res) => {
    try {
      const { modulId, dataId } = req.params;
      const entry = await updateApproval({
        user: { ...(req.body?.user || {}), ...(req.user || {}) },
        modulId,
        dataId,
        status: req.body?.status,
        detail: req.body?.detail,
      });
      res.json(entry);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Gagal memperbarui status approval",
        error: error.message,
      });
    }
  },
);

router.delete("/", async (_req, res) => {
  try {
    await clearApprovals();
    res.json({ success: true, message: "Log approval berhasil dihapus" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal menghapus log approval",
      error: error.message,
    });
  }
});

export default router;
