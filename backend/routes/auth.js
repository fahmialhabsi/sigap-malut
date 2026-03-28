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
  generateSsoToken,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/profile", protect, getMe); // alias for /me
router.post("/logout", protect, logout);
router.put("/change-password", protect, changePassword);
router.post("/sso-token", protect, generateSsoToken); // SSO: generate token untuk e-Pelara

// Route untuk mengambil seluruh data user

// Tambah user (admin)
router.post("/users", protect, createUser);
// Ambil semua user (admin)
router.get("/users", protect, getAllUsers);

// Update user (admin)
router.put("/users/:id", protect, updateUser);

// Hapus user (admin)
router.delete("/users/:id", protect, deleteUser);

// GET /auth/hierarchy — ambil has_subordinate flag untuk user yang sedang login
router.get("/hierarchy", protect, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "unauthenticated" });

    const { QueryTypes } = await import("sequelize");
    const db = (await import("../config/database.js")).default;

    const rows = await db
      .query(
        "SELECT has_subordinate, supervisor_id, unit_kerja FROM user_hierarchy WHERE user_id = :userId LIMIT 1",
        { replacements: { userId }, type: QueryTypes.SELECT },
      )
      .catch(() => []);

    if (rows && rows.length > 0) {
      return res.json({
        success: true,
        data: {
          user_id: userId,
          has_subordinate:
            rows[0].has_subordinate === true || rows[0].has_subordinate === 1,
          supervisor_id: rows[0].supervisor_id,
          unit_kerja: rows[0].unit_kerja,
        },
      });
    }

    // Fallback: inferensi dari unit_kerja user jika tabel belum ada datanya
    const unitKerja = String(req.user?.unit_kerja || "").toLowerCase();
    const hasSubordinate =
      unitKerja.includes("ketersediaan") ||
      unitKerja.includes("distribusi") ||
      unitKerja.includes("konsumsi");

    res.json({
      success: true,
      data: {
        user_id: userId,
        has_subordinate: hasSubordinate,
        supervisor_id: null,
        unit_kerja: req.user?.unit_kerja || null,
        source: "inferred",
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
