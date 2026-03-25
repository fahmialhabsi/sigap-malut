// Clean ES module auth controller
import { Op, fn, col, where } from "sequelize";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Role from "../models/Role.js";
import {
  hashPassword,
  comparePassword,
  validatePassword,
} from "../config/auth.js";
import { generateToken, generateRefreshToken } from "../middleware/auth.js";
import { logAudit } from "../services/auditLogService.js";

// SSO: Generate short-lived token untuk diverifikasi e-Pelara
export const generateSsoToken = async (req, res) => {
  try {
    const ssoSecret = process.env.SSO_SHARED_SECRET;
    if (!ssoSecret) {
      return res.status(500).json({
        success: false,
        message: "SSO_SHARED_SECRET tidak dikonfigurasi",
      });
    }
    const user = req.user;

    // Ambil role name dari tabel Roles berdasarkan role_id agar mendapatkan
    // nama role semantik (SEKRETARIS, KEPALA_DINAS, dst).
    // user.role (field langsung di tabel users) bisa jadi default "pelaksana".
    let roleName = user.role; // fallback ke field langsung di users
    try {
      const dbUser = await User.findByPk(user.id);
      if (dbUser?.role_id) {
        const roleRow = await Role.findByPk(dbUser.role_id);
        if (roleRow?.name) {
          roleName = roleRow.name;
        } else if (roleRow?.code) {
          roleName = roleRow.code;
        }
      }
      // Jika tidak ada role_id tapi ada role langsung di tabel, pakai itu
      if (!roleName && dbUser?.role) {
        roleName = dbUser.role;
      }
    } catch (lookupErr) {
      console.warn(
        "[generateSsoToken] Role lookup fallback:",
        lookupErr.message,
      );
    }

    console.log(
      `[generateSsoToken] user=${user.username} role_raw=${user.role} role_resolved=${roleName}`,
    );

    const ssoToken = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        role: roleName,
        unit_kerja: user.unit_kerja,
        nama_lengkap: user.nama_lengkap,
        type: "sso",
      },
      ssoSecret,
      { expiresIn: "15m" },
    );
    res.json({ success: true, token: ssoToken, role: roleName });
  } catch (error) {
    console.error("generateSsoToken error:", error);
    res
      .status(500)
      .json({ success: false, message: "Gagal membuat SSO token" });
  }
};

async function generateUniqueUsernameFromEmail(email) {
  const base = String(email || "")
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "")
    .slice(0, 30);

  let candidate = base || `user${Date.now()}`;
  let i = 1;

  while (true) {
    const exists = await User.findOne({ where: { username: candidate } });
    if (!exists) return candidate;
    candidate = `${base || "user"}${i}`;
    i += 1;
  }
}

function normalizeRoleInput(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function buildRoleCandidates(role) {
  const normalizedRole = normalizeRoleInput(role);
  if (!normalizedRole) {
    return { codeCandidates: [], nameCandidates: [] };
  }

  const codeCandidates = Array.from(
    new Set([
      normalizedRole,
      normalizedRole.replace(/\s+/g, "_"),
      normalizedRole.replace(/[\s-]+/g, "_"),
      normalizedRole.replace(/[\s_]+/g, "-"),
    ]),
  );

  const nameCandidates = Array.from(
    new Set(
      codeCandidates.map((candidate) => candidate.replace(/[_-]+/g, " ")),
    ),
  );

  return { codeCandidates, nameCandidates };
}

async function resolveRoleRow({ role, role_id }) {
  if (role_id) {
    const roleById = await Role.findByPk(String(role_id).trim());
    if (!roleById) {
      return {
        roleRow: null,
        error: `Role_id '${role_id}' tidak ditemukan di tabel roles`,
      };
    }
    return { roleRow: roleById, error: null };
  }

  const { codeCandidates, nameCandidates } = buildRoleCandidates(role);
  if (codeCandidates.length === 0) {
    return { roleRow: null, error: null };
  }

  const roleRow = await Role.findOne({
    where: {
      [Op.or]: [
        { code: { [Op.in]: codeCandidates } },
        where(fn("LOWER", col("name")), { [Op.in]: nameCandidates }),
      ],
    },
  });

  if (!roleRow) {
    return {
      roleRow: null,
      error: `Role '${role}' tidak ditemukan di tabel roles`,
    };
  }

  return { roleRow, error: null };
}

// Register (POST /api/auth/register)
export const register = async (req, res) => {
  try {
    const { username, name, email, password, role_id, unit_id, position_id } =
      req.body;

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

    const existingUserByEmail = await User.findOne({ where: { email } });
    if (existingUserByEmail) {
      return res
        .status(400)
        .json({ success: false, message: "Email sudah digunakan" });
    }

    const resolvedUsername =
      username || (await generateUniqueUsernameFromEmail(email));

    // Optional: ensure username unique (in case client provides)
    const existingUserByUsername = await User.findOne({
      where: { username: resolvedUsername },
    });
    if (existingUserByUsername) {
      return res.status(400).json({
        success: false,
        message: "Username sudah digunakan",
      });
    }

    // Optional: validate role exists and active
    const roleRow = await Role.findByPk(role_id);
    if (!roleRow || roleRow.is_active === false) {
      return res.status(400).json({
        success: false,
        message: "Role tidak valid atau tidak aktif",
      });
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      username: resolvedUsername,
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
          username: user.username,
          name: user.name,
          email: user.email,
          role_id: user.role_id,
          unit_id: user.unit_id,
          position_id: user.position_id,
          is_active: user.is_active,
        },
        roleName: roleRow?.name || null,
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

    // Optional: lockout enforcement if locked_until is set
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return res.status(423).json({
        success: false,
        message: "Akun terkunci sementara. Coba lagi nanti.",
        locked_until: user.locked_until,
      });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      user.failed_login_attempts = (user.failed_login_attempts || 0) + 1;
      if (user.failed_login_attempts >= 5)
        user.locked_until = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();
      try {
        await logAudit?.({
          modul: "AUTH",
          entitas_id: user.id,
          aksi: "LOGIN_FAILED",
          data_lama: null,
          data_baru: { attempts: user.failed_login_attempts },
          pegawai_id: user.id,
        });
      } catch (_) {}
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

    // Lookup role from Roles table (source of truth)
    const roleRow = user.role_id ? await Role.findByPk(user.role_id) : null;
    const roleName = roleRow?.name || null; // e.g. "GUBERNUR", "KEPALA_DINAS"

    // Dashboard mapping (sesuai dokumenSistem: eksekutif -> /dashboard)
    const roleToDashboard = {
      SUPER_ADMIN: "/dashboard/superadmin",
      SEKRETARIS: "/dashboard/sekretariat",
      KEPALA_DINAS: "/dashboard",
      GUBERNUR: "/dashboard",
      KEPALA_BIDANG: "/dashboard",
      KEPALA_BIDANG_KETERSEDIAAN: "/dashboard/ketersediaan",
      KEPALA_BIDANG_DISTRIBUSI: "/dashboard/distribusi",
      KEPALA_BIDANG_KONSUMSI: "/dashboard/konsumsi",
      KEPALA_UPTD: "/dashboard/uptd",
      VIEWER: "/dashboard-publik",
    };

    // Untuk role staf yang tidak ada di mapping eksplisit,
    // tentukan dashboard berdasarkan unit_kerja
    let dashboardUrl = roleToDashboard[roleName];
    if (!dashboardUrl) {
      const unitKerja = (user.unit_kerja || "").toLowerCase();
      if (unitKerja.includes("ketersediaan"))
        dashboardUrl = "/dashboard/ketersediaan";
      else if (unitKerja.includes("distribusi"))
        dashboardUrl = "/dashboard/distribusi";
      else if (unitKerja.includes("konsumsi"))
        dashboardUrl = "/dashboard/konsumsi";
      else if (unitKerja.includes("sekretariat"))
        dashboardUrl = "/dashboard/sekretariat";
      else if (unitKerja.includes("uptd")) dashboardUrl = "/dashboard/uptd";
      else dashboardUrl = "/dashboard";
    }

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
          username: user.username,
          name: user.name,
          email: user.email,
          role_id: user.role_id,
          unit_id: user.unit_id,
        },
        roleName,
        token,
        refreshToken,
        dashboardUrl,
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
  try {
    await logAudit?.({
      modul: "AUTH",
      entitas_id: req.user?.id,
      aksi: "LOGOUT",
      data_lama: null,
      data_baru: null,
      pegawai_id: req.user?.id,
    });
  } catch (_) {}
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
      role, // string key (optional)
      role_id, // uuid (optional)
      unit_kerja,
      unit_id,
      nip,
      jabatan,
    } = req.body;

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Password tidak valid",
        errors: passwordValidation.errors,
      });
    }

    const existingUser = await User.findOne({
      where: { [Op.or]: [{ username }, { email }] },
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

    if (!role && !role_id) {
      return res.status(400).json({
        success: false,
        message: "Role atau role_id wajib diisi",
      });
    }

    const { roleRow, error: roleError } = await resolveRoleRow({
      role,
      role_id,
    });
    if (roleError) {
      return res.status(400).json({ success: false, message: roleError });
    }

    const resolvedRoleId = roleRow?.id || null;
    const resolvedRoleCode =
      roleRow?.code || normalizeRoleInput(role).replace(/\s+/g, "_") || null;

    const hashedPassword = await hashPassword(password);

    let user;
    try {
      user = await User.create({
        username,
        email,
        password: hashedPassword,
        plain_password: password,
        nama_lengkap,
        role: resolvedRoleCode,
        role_id: resolvedRoleId, // ALWAYS UUID or null
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
        user = await User.create({
          username,
          email,
          password: hashedPassword,
          nama_lengkap,
          role: resolvedRoleCode,
          role_id: resolvedRoleId,
          unit_kerja: unit_kerja || null,
          unit_id: unit_id || unit_kerja || null,
          nip,
          jabatan,
          is_verified: true,
        });
      } else {
        throw err;
      }
    }

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
      role, // string key (optional)
      role_id, // uuid (optional)
      unit_kerja,
      unit_id,
      nip,
      jabatan,
    } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User tidak ditemukan" });
    }

    user.username = username ?? user.username;
    user.email = email ?? user.email;
    user.nama_lengkap = nama_lengkap ?? user.nama_lengkap;
    user.unit_kerja = unit_kerja ?? user.unit_kerja;
    user.unit_id = unit_id ?? user.unit_id ?? user.unit_kerja;
    user.nip = nip ?? user.nip;
    user.jabatan = jabatan ?? user.jabatan;

    // Resolve role_id safely if role_id or role provided
    if (role_id || role) {
      const { roleRow, error: roleError } = await resolveRoleRow({
        role,
        role_id,
      });
      if (roleError) {
        return res.status(400).json({ success: false, message: roleError });
      }
      if (roleRow) {
        user.role_id = roleRow.id;
        user.role = roleRow.code || user.role;
      }
    }
    // else: keep existing user.role_id as-is

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
