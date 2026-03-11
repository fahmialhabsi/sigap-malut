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
import limiter from "../middleware/rateLimiter.js";

const router = express.Router();

// Apply rate limiting to all auth endpoints.
router.use(limiter);

// Public routes
router.post("/register", register);
router.post("/login", login);

// Identity endpoints: require authentication only (do NOT run module-level authorization)
// /profile mengembalikan req.user yang diisi oleh middleware protect
router.get("/profile", protect, (req, res) => {
  try {
    // Prevent caching of identity responses so clients always fetch fresh profile
    res.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");

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
