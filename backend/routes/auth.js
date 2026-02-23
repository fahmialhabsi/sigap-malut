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

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);
router.put("/change-password", protect, changePassword);

// Route untuk mengambil seluruh data user

// Tambah user (admin)
router.post("/users", protect, createUser);
// Ambil semua user (admin)
router.get("/users", protect, getAllUsers);

// Update user (admin)
router.put("/users/:id", protect, updateUser);

// Hapus user (admin)
router.delete("/users/:id", protect, deleteUser);

export default router;
