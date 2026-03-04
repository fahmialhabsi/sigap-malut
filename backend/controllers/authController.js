// Clean ES module auth controller
import { Op } from "sequelize";
import User from "../models/User.js";
import {
  hashPassword,
  comparePassword,
  validatePassword,
} from "../config/auth.js";
import { generateToken, generateRefreshToken } from "../middleware/auth.js";
import { logAudit } from "../services/auditLogService.js";

// Register (POST /api/auth/register)
export const register = async (req, res) => {
  try {
    const { name, email, password, role_id, unit_id, position_id } = req.body;

    if (!name || !email || !password || !role_id || !unit_id) {
      return res.status(400).json({
        success: false,
        message: "Nama, email, password, role_id, unit_id wajib diisi",
      });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Password tidak valid",
        errors: passwordValidation.errors,
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser)
      return res
        .status(400)
        .json({ success: false, message: "Email sudah digunakan" });

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      plain_password: password,
      role_id,
      unit_id,
      position_id,
      is_active: true,
    });

    await logAudit?.({
      modul: "AUTH",
      entitas_id: user.id,
      aksi: "REGISTER",
      data_lama: null,
      data_baru: user,
      pegawai_id: user.id,
    });

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

// Login (POST /api/auth/login)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Email dan password wajib diisi" });

    const user = await User.findOne({ where: { email } });

    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Email atau password salah" });
    if (!user.is_active)
      return res.status(403).json({
        success: false,
        message: "Akun tidak aktif. Hubungi administrator.",
      });

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      user.failed_login_attempts = (user.failed_login_attempts || 0) + 1;
      if (user.failed_login_attempts >= 5)
        user.locked_until = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();
      return res.status(401).json({
        success: false,
        message: "Email atau password salah",
        attempts_remaining: Math.max(0, 5 - user.failed_login_attempts),
      });
    }

    user.failed_login_attempts = 0;
    user.locked_until = null;
    user.last_login = new Date();
    await user.save();

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    if (user && user.id) {
      try {
        await logAudit?.({
          modul: "AUTH",
          entitas_id: user.id,
          aksi: "LOGIN",
          data_lama: null,
          data_baru: user,
          pegawai_id: user.id,
        });
      } catch (auditErr) {
        console.warn(
          "Audit log failed (login):",
          auditErr?.message || auditErr,
        );
      }
    }

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

// Get current user (GET /api/auth/me)
export const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ["password"] },
    });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error mengambil data user",
      error: error.message,
    });
  }
};

// Logout
export const logout = async (req, res) => {
  // TODO: Invalidate refresh token in database
  res.json({ success: true, message: "Logout berhasil" });
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const user = await User.findByPk(req.user.id);
    const isValid = await comparePassword(current_password, user.password);
    if (!isValid)
      return res
        .status(400)
        .json({ success: false, message: "Password saat ini salah" });

    const validation = validatePassword(new_password);
    if (!validation.isValid)
      return res.status(400).json({
        success: false,
        message: "Password baru tidak valid",
        errors: validation.errors,
      });

    user.password = await hashPassword(new_password);
    await user.save();

    if (user && user.id) {
      try {
        await logAudit({
          modul: "AUTH",
          entitas_id: user.id,
          aksi: "CHANGE_PASSWORD",
          data_lama: null,
          data_baru: null,
          pegawai_id: user.id,
        });
      } catch (auditErr) {
        console.warn(
          "Audit log failed (changePassword):",
          auditErr?.message || auditErr,
        );
      }
    }

    res.json({ success: true, message: "Password berhasil diubah" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error mengubah password",
      error: error.message,
    });
  }
};

// Admin: Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
      order: [["created_at", "ASC"]],
    });
    // attach `password` field for admin UI (maps to persisted plain_password)
    const mapped = users.map((u) => {
      const obj = u.toJSON ? u.toJSON() : u;
      return { ...obj, password: obj.plain_password || "" };
    });
    res.json({ success: true, data: mapped });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error mengambil data users",
      error: error.message,
    });
  }
};

// Admin: Create user
export const createUser = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      nama_lengkap,
      role,
      role_id,
      unit_kerja,
      unit_id,
      nip,
      jabatan,
    } = req.body;
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid)
      return res.status(400).json({
        success: false,
        message: "Password tidak valid",
        errors: passwordValidation.errors,
      });

    const existingUser = await User.findOne({
      where: { [Op.or]: [{ username }, { email }] },
    });
    if (existingUser)
      return res.status(400).json({
        success: false,
        message:
          existingUser.username === username
            ? "Username sudah digunakan"
            : "Email sudah digunakan",
      });

    const hashedPassword = await hashPassword(password);
    let user;
    try {
      user = await User.create({
        username,
        email,
        password: hashedPassword,
        plain_password: password,
        nama_lengkap,
        role: role || null,
        role_id: role_id || role || null,
        unit_kerja: unit_kerja || null,
        unit_id: unit_id || unit_kerja || null,
        nip,
        jabatan,
        is_verified: true,
      });
    } catch (err) {
      const msg = String(err?.message || err);
      if (
        msg.includes("plain_password") ||
        msg.includes('column "plain_password"')
      ) {
        try {
          user = await User.create({
            username,
            email,
            password: hashedPassword,
            nama_lengkap,
            role: role || null,
            role_id: role_id || role || null,
            unit_kerja: unit_kerja || null,
            unit_id: unit_id || unit_kerja || null,
            nip,
            jabatan,
            is_verified: true,
          });
        } catch (err2) {
          throw err2;
        }
      } else {
        throw err;
      }
    }

    // Return created user and include `password` field pointing to plain_password
    const created = user.toJSON ? user.toJSON() : user;
    created.password = created.plain_password || password || "";
    res.status(201).json({
      success: true,
      message: "User berhasil ditambahkan",
      data: created,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error menambah user",
      error: error.message,
    });
  }
};

// Admin: Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      username,
      email,
      password,
      nama_lengkap,
      role,
      role_id,
      unit_kerja,
      unit_id,
      nip,
      jabatan,
    } = req.body;
    const user = await User.findByPk(id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User tidak ditemukan" });

    user.username = username ?? user.username;
    user.email = email ?? user.email;
    user.nama_lengkap = nama_lengkap ?? user.nama_lengkap;
    user.role = role ?? user.role;
    user.role_id = role_id ?? user.role_id ?? role ?? user.role;
    user.unit_kerja = unit_kerja ?? user.unit_kerja;
    user.unit_id = unit_id ?? user.unit_id ?? unit_kerja ?? user.unit_kerja;
    user.nip = nip ?? user.nip;
    user.jabatan = jabatan ?? user.jabatan;

    if (password) {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid)
        return res.status(400).json({
          success: false,
          message: "Password tidak valid",
          errors: passwordValidation.errors,
        });
      user.password = await hashPassword(password);
      // persist plaintext for admin UI when requested
      user.plain_password = password;
    }

    await user.save();
    const updated = user.toJSON ? user.toJSON() : user;
    updated.password = updated.plain_password || "";
    res.json({
      success: true,
      message: "User berhasil diupdate",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error mengupdate user",
      error: error.message,
    });
  }
};

// Admin: Delete user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User tidak ditemukan" });
    await user.destroy();
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
