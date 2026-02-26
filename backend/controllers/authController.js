// @desc    Delete user
// @route   DELETE /api/auth/users/:id
// @access  Private (Admin)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User tidak ditemukan" });
    }
    await user.destroy();
    // Audit trail
    await logAudit({
      modul: "AUTH",
      entitas_id: user.id,
      aksi: "DELETE",
      data_lama: user,
      data_baru: null,
      pegawai_id: req.user?.id || null,
    });
    res.json({ success: true, message: "User berhasil dihapus" });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Error menghapus user",
        error: error.message,
      });
  }
};
// @desc    Create new user (Admin)
// @route   POST /api/auth/users
// @access  Private (Admin)
export const createUser = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      nama_lengkap,
      role,
      unit_kerja,
      nip,
      jabatan,
    } = req.body;

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Password tidak valid",
        errors: passwordValidation.errors,
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }],
      },
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          existingUser.username === username
            ? "Username sudah digunakan"
            : "Email sudah digunakan",
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      nama_lengkap,
      role: role || "pelaksana",
      unit_kerja,
      nip,
      jabatan,
      is_verified: true,
    });

    res.status(201).json({
      success: true,
      message: "User berhasil ditambahkan",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error menambah user",
      error: error.message,
    });
  }
};

// @desc    Update user (Admin)
// @route   PUT /api/auth/users/:id
// @access  Private (Admin)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      username,
      email,
      password,
      nama_lengkap,
      role,
      unit_kerja,
      nip,
      jabatan,
    } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    // Update fields
    user.username = username ?? user.username;
    user.email = email ?? user.email;
    user.nama_lengkap = nama_lengkap ?? user.nama_lengkap;
    user.role = role ?? user.role;
    user.unit_kerja = unit_kerja ?? user.unit_kerja;
    user.nip = nip ?? user.nip;
    user.jabatan = jabatan ?? user.jabatan;

    // Update password jika ada
    if (password) {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: "Password tidak valid",
          errors: passwordValidation.errors,
        });
      }
      user.password = await hashPassword(password);
    }

    await user.save();

    res.json({
      success: true,
      message: "User berhasil diupdate",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error mengupdate user",
      error: error.message,
    });
  }
};
// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private (atau sesuaikan kebutuhan)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
      order: [["created_at", "ASC"]],
    });
    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error mengambil data users",
      error: error.message,
    });
  }
};
import User from "../models/User.js";
import sequelize from "../config/database.js"; // ← TAMBAHKAN INI
import { Op } from "sequelize"; // ← TAMBAHKAN INI

import {
  hashPassword,
  comparePassword,
  validatePassword,
} from "../config/auth.js";
import { generateToken, generateRefreshToken } from "../middleware/auth.js";
import { logAudit } from "../services/auditLogService.js";

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      nama_lengkap,
      role,
      unit_kerja,
      nip,
      jabatan,
    } = req.body;

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Password tidak valid",
        errors: passwordValidation.errors,
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          existingUser.username === username
            ? "Username sudah digunakan"
            : "Email sudah digunakan",
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      nama_lengkap,
      role: role || "pelaksana",
      unit_kerja,
      nip,
      jabatan,
      is_verified: true,
    });

    // Audit trail
    await logAudit({
      modul: "AUTH",
      entitas_id: user.id,
      aksi: "REGISTER",
      data_lama: null,
      data_baru: user,
      pegawai_id: user.id,
    });

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(201).json({
      success: true,
      message: "User berhasil didaftarkan",
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          nama_lengkap: user.nama_lengkap,
          role: user.role,
          unit_kerja: user.unit_kerja,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Error saat registrasi",
      error: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username dan password wajib diisi",
      });
    }

    // Find user
    const user = await User.findOne({
      where: {
        [Op.or]: [{ username }, { email: username }],
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Username atau password salah",
      });
    }

    // Check if account is locked
    if (user.locked_until && new Date() < new Date(user.locked_until)) {
      return res.status(403).json({
        success: false,
        message: "Akun terkunci. Silakan coba lagi nanti.",
      });
    }

    // Check if account is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "Akun tidak aktif. Hubungi administrator.",
      });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      // Increment failed attempts
      user.failed_login_attempts += 1;

      // Lock account after 5 failed attempts
      if (user.failed_login_attempts >= 5) {
        user.locked_until = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      }

      await user.save();

      return res.status(401).json({
        success: false,
        message: "Username atau password salah",
        attempts_remaining: Math.max(0, 5 - user.failed_login_attempts),
      });
    }

    // Reset failed attempts
    user.failed_login_attempts = 0;
    user.locked_until = null;
    user.last_login_at = new Date();
    user.last_login_ip = req.ip;
    await user.save();

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Audit trail
    await logAudit({
      modul: "AUTH",
      entitas_id: user.id,
      aksi: "LOGIN",
      data_lama: null,
      data_baru: user,
      pegawai_id: user.id,
    });

    res.json({
      success: true,
      message: "Login berhasil",
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          nama_lengkap: user.nama_lengkap,
          role: user.role,
          unit_kerja: user.unit_kerja,
          jabatan: user.jabatan,
          foto: user.foto,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error saat login",
      error: error.message,
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error mengambil data user",
      error: error.message,
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  // TODO: Invalidate refresh token in database
  res.json({
    success: true,
    message: "Logout berhasil",
  });
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    const user = await User.findByPk(req.user.id);

    // Verify current password
    const isValid = await comparePassword(current_password, user.password);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Password saat ini salah",
      });
    }

    // Validate new password
    const validation = validatePassword(new_password);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Password baru tidak valid",
        errors: validation.errors,
      });
    }

    // Hash and save new password
    user.password = await hashPassword(new_password);
    await user.save();

    // Audit trail
    await logAudit({
      modul: "AUTH",
      entitas_id: user.id,
      aksi: "CHANGE_PASSWORD",
      data_lama: null,
      data_baru: null,
      pegawai_id: user.id,
    });

    res.json({
      success: true,
      message: "Password berhasil diubah",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error mengubah password",
      error: error.message,
    });
  }
};
