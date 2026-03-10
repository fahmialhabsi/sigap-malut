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
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Identity endpoints: require authentication only (do NOT run module-level authorization)
// /me tetap ada (menggunakan controller getMe), tapi kita tambahkan /profile yang
// langsung mengembalikan req.user agar tidak memicu pengecekan module/role/unit tambahan.
router.get("/profile", protect, (req, res) => {
  try {
    // protect middleware sudah mengisi req.user dari token
    const user = req.user || null;
    return res.json({ success: true, data: user });
  } catch (err) {
    console.error("GET /auth/profile error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
});

// existing protected identity route (keberadaan ini tetap aman)
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);
router.put("/change-password", protect, changePassword);

// Route untuk mengambil seluruh data user (admin)
// Tambah user (admin)
router.post("/users", protect, createUser);
// Ambil semua user (admin)
router.get("/users", protect, getAllUsers);

// Update user (admin)
router.put("/users/:id", protect, updateUser);

// Hapus user (admin)
router.delete("/users/:id", protect, deleteUser);

export default router;
