const bcrypt = require('bcrypt');
const { signAccess, signRefresh } = require('../utils/jwt');

// NOTE: This controller expects a User model available via req.app.get('models')
module.exports = {
  async login(req, res, next){
    try{
      const { username, password } = req.body;
      const { User } = req.app.get('models') || {};
      if(!User) return res.status(500).json({error:'models not initialized'});
      const user = await User.findOne({ where: { username } });
      if(!user) return res.status(401).json({error:'invalid credentials'});
      const ok = await bcrypt.compare(password, user.password_hash);
      if(!ok) return res.status(401).json({error:'invalid credentials'});
      const claims = { sub: user.id, role: user.role, bidang: user.bidang };
      const access = signAccess(claims);
      const refresh = signRefresh({ sub: user.id });
      return res.json({ access, refresh, user: { id: user.id, username: user.username, role: user.role } });
    }catch(err){ next(err); }
  },

  async refresh(req, res, next){
    try{
      const { token } = req.body;
      const { verifyRefresh, signAccess } = require('../utils/jwt');
      const payload = verifyRefresh(token);
      const { User } = req.app.get('models') || {};
      const user = await User.findByPk(payload.sub);
      if(!user) return res.status(401).json({error:'invalid refresh token'});
      const access = signAccess({ sub: user.id, role: user.role, bidang: user.bidang });
      return res.json({ access });
    }catch(err){ return res.status(401).json({ error: 'invalid token' }); }
  }
}
// File: backend/controllers/authController.js
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
    res.status(500).json({
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
// REGISTER (POST /api/auth/register)
export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role_id,
      unit_id,
      position_id, // optional
    } = req.body;

    // Validasi wajib
    if (!name || !email || !password || !role_id || !unit_id) {
      return res.status(400).json({
        success: false,
        message: "Nama, email, password, role_id, unit_id wajib diisi",
      });
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Password tidak valid",
        errors: passwordValidation.errors,
      });
    }

    // Check if user already exists (by email)
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email sudah digunakan",
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role_id,
      unit_id,
      position_id,
      is_active: true,
    });

    // Audit trail (opsional)
    await logAudit?.({
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
          name: user.name,
          email: user.email,
          role_id: user.role_id,
          unit_id: user.unit_id,
          position_id: user.position_id,
          is_active: user.is_active,
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
// LOGIN (POST /api/auth/login)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email dan password wajib diisi",
      });
    }

    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah",
      });
    }

    // Akun tidak aktif
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "Akun tidak aktif. Hubungi administrator.",
      });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      // Optional: increment failed attempt + lock account
      user.failed_login_attempts = (user.failed_login_attempts || 0) + 1;
      if (user.failed_login_attempts >= 5) {
        user.locked_until = new Date(Date.now() + 15 * 60 * 1000); // 15 menit
      }
      await user.save();
      return res.status(401).json({
        success: false,
        message: "Email atau password salah",
        attempts_remaining: Math.max(0, 5 - user.failed_login_attempts),
      });
    }

    // Jika sukses, reset log attempt
    user.failed_login_attempts = 0;
    user.locked_until = null;
    user.last_login = new Date();
    await user.save();

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Audit trail
    await logAudit?.({
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
          name: user.name,
          email: user.email,
          role_id: user.role_id,
          unit_id: user.unit_id,
          position_id: user.position_id,
          is_active: user.is_active,
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
