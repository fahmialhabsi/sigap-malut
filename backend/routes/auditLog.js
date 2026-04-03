// =====================================================
// Routes: Auditlog CRUD — /api/auditlog
// Baca: izin audit-log:read. Tulis/hapus: hanya super_admin.
// =====================================================

import express from "express";
import {
  getAllAuditlog,
  getAuditlogById,
  createAuditlog,
  updateAuditlog,
  deleteAuditlog,
} from "../controllers/auditLog.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/roleCheck.js";
import { requirePermission } from "../middleware/permissionCheck.js";

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(requirePermission("audit-log", "read"), getAllAuditlog)
  .post(authorize("super_admin"), createAuditlog);

router
  .route("/:id")
  .get(requirePermission("audit-log", "read"), getAuditlogById)
  .put(authorize("super_admin"), updateAuditlog)
  .delete(authorize("super_admin"), deleteAuditlog);

export default router;
