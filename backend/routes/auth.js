// File: backend/routes/auth.js
import express from "express";
import {
  register,
  login,
  getMe,
  logout,
  changePassword,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserManagementAuditLog,
  getUserManagementAuditArchiveLog,
  exportUserManagementAuditCsv,
  archiveUserManagementAuditRetention,
  generateSsoToken,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { authorize } from "../middleware/roleCheck.js";
import {
  authLoginLimiter,
  authRegisterLimiter,
} from "../middleware/authRateLimiter.js";

const router = express.Router();

router.post("/register", authRegisterLimiter, register);
router.post("/login", authLoginLimiter, login);
router.get("/me", protect, getMe);
router.get("/profile", protect, getMe); // alias for /me
router.post("/logout", protect, logout);
router.put("/change-password", protect, changePassword);
router.post("/sso-token", protect, generateSsoToken); // SSO: generate token untuk e-Pelara

// Route untuk mengambil seluruh data user

// Manajemen user — hanya super_admin (Tahap 1 keamanan / matriks dokumen 14)
router.post("/users", protect, authorize("super_admin"), createUser);
router.get("/users", protect, authorize("super_admin"), getAllUsers);
router.get(
  "/users/audit-log/export",
  protect,
  authorize("super_admin"),
  exportUserManagementAuditCsv,
);
router.post(
  "/users/audit-log/archive-retention",
  protect,
  authorize("super_admin"),
  archiveUserManagementAuditRetention,
);
router.get(
  "/users/audit-log/archive",
  protect,
  authorize("super_admin"),
  getUserManagementAuditArchiveLog,
);
router.get(
  "/users/audit-log",
  protect,
  authorize("super_admin"),
  getUserManagementAuditLog,
);
router.put("/users/:id", protect, authorize("super_admin"), updateUser);
router.delete("/users/:id", protect, authorize("super_admin"), deleteUser);

export default router;
