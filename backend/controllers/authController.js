// Clean ES module auth controller
import { randomUUID } from "crypto";
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
import AuditLog from "../models/auditLog.js";
import AuditLogArchive from "../models/AuditLogArchive.js";
import { archiveUserManagementAuditOlderThan } from "../services/auditLogRetentionService.js";

const USER_MGMT_MODUL = "USER_MANAGEMENT";

/** Snapshot user untuk audit — tanpa hash/kata sandi plaintext. */
function snapshotUserForAudit(user) {
  if (!user) return null;
  const plain = user.get ? user.get({ plain: true }) : { ...user };
  const o = { ...plain };
  if ("password" in o) o.password = "[REDACTED]";
  if ("plain_password" in o) o.plain_password = "[REDACTED]";
  return o;
}

function actorPegawaiId(req) {
  const id = req.user?.id;
  return id != null && id !== "" ? String(id) : "unknown";
}

/** Kunci role konsisten untuk JWT + matriks RBAC (sumber: roles.code/name, fallback users.role). */
function normalizeRoleKeyForRbac(v) {
  if (v == null || v === "") return "pelaksana";
  return String(v).trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function canonicalRoleFromRoleRow(roleRow, fallbackUserRole) {
  if (roleRow?.code) return normalizeRoleKeyForRbac(roleRow.code);
  if (roleRow?.name) return normalizeRoleKeyForRbac(roleRow.name);
  return normalizeRoleKeyForRbac(fallbackUserRole);
}

/**
 * Jika role_id mengarah ke peran induk / varian sekretaris (mis. sekretaris_dinas)
 * sementara kolom users.role memuat peran spesifik (mis. fungsional_keuangan),
 * utamakan kolom users.role agar dashboard & JWT selaras.
 */
function mergeCanonicalRoleWithUsersColumn(
  canonicalFromRow,
  usersRoleColumn,
  roleToDashboard,
) {
  const fromColumn = normalizeRoleKeyForRbac(usersRoleColumn || "");
  if (!fromColumn || fromColumn === canonicalFromRow) return canonicalFromRow;
  if (!roleToDashboard[fromColumn]) return canonicalFromRow;

  /** Peran spesifik yang disimpan di kolom users.role */
  const specificRoles = new Set([
    "fungsional_perencana",
    "fungsional_perencanaan",
    "fungsional_keuangan",
    "fungsional_ketersediaan",
    "fungsional_distribusi",
    "fungsional_konsumsi",
    "fungsional_analis",
    "ppk",
    "pelaksana_ketersediaan",
    "pelaksana_distribusi",
    "pelaksana_konsumsi",
    "kasubag_umum_kepegawaian",
    "kasubag",
    "kasubbag",
    "kasubbag_umum",
    "kasubbag_kepegawaian",
    "bendahara_pengeluaran",
    "bendahara_gaji",
    "bendahara_barang",
    "jabatan_fungsional",
    "pejabat_fungsional",
    "fungsional_uptd_mutu",
    "fungsional_uptd_teknis",
    "kasi_mutu_uptd",
    "kasi_teknis_uptd",
    "kasubbag_tu_uptd",
  ]);

  if (!specificRoles.has(fromColumn)) return canonicalFromRow;

  /** Peran “induk” dari baris roles — atau apa pun yang diawali sekretaris_ */
  const parentRoles = new Set([
    "sekretaris",
    "bendahara",
    "fungsional",
    "jabatan_fungsional",
    "staf",
    "pelaksana",
  ]);

  const row = String(canonicalFromRow || "");
  const isParentOrSekretarisFamily =
    parentRoles.has(canonicalFromRow) ||
    row.startsWith("sekretaris") ||
    row.startsWith("kepala_bidang");

  if (isParentOrSekretarisFamily) return fromColumn;
  return canonicalFromRow;
}

function buildTokenPayloadFromUser(user, roleRow) {
  const plain = user?.get?.({ plain: true }) ?? user ?? {};
  return {
    id: plain.id,
    username: plain.username,
    email: plain.email,
    role: canonicalRoleFromRoleRow(roleRow, plain.role),
    unit_kerja: plain.unit_kerja || plain.unit_id || "",
    nama_lengkap: plain.nama_lengkap || plain.name || "",
  };
}

async function resolveRoleRowForLogin(user) {
  if (user.role_id) {
    const row = await Role.findByPk(String(user.role_id).trim());
    if (row) return row;
  }
  const { roleRow } = await resolveRoleRow({
    role: user.role,
    role_id: null,
  });
  return roleRow;
}

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

function displayNameFromRoleCode(codeKey) {
  const s = normalizeRoleKeyForRbac(codeKey);
  if (!s) return "Role";
  return s
    .split("_")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

async function getNextRoleLevel() {
  const max = await Role.max("level");
  const n = max == null || max === undefined ? 0 : Number(max);
  return Number.isFinite(n) ? n + 1 : 1;
}

/**
 * Untuk Manajemen User (Super Admin): jika role belum ada di tabel `roles`,
 * buat baris baru otomatis agar produksi tidak bergantung pada skrip SQL manual.
 */
async function resolveOrCreateRoleRow({ role, role_id }) {
  const first = await resolveRoleRow({ role, role_id });
  if (!first.error && first.roleRow) {
    return { ...first, roleAutoCreated: false };
  }

  if (role_id) {
    return { ...first, roleAutoCreated: false };
  }

  const codeKey = normalizeRoleKeyForRbac(role);
  if (!codeKey) {
    return { ...first, roleAutoCreated: false };
  }

  const existingByCode = await Role.findOne({ where: { code: codeKey } });
  if (existingByCode) {
    return { roleRow: existingByCode, error: null, roleAutoCreated: false };
  }

  let name = displayNameFromRoleCode(codeKey);
  const nameTaken = await Role.findOne({
    where: { name },
  });
  if (nameTaken) {
    name = `${displayNameFromRoleCode(codeKey)} [${codeKey}]`;
  }

  try {
    let level = await getNextRoleLevel();
    const created = await Role.create({
      id: randomUUID(),
      code: codeKey,
      name,
      level,
      description:
        "Dibuat otomatis dari Manajemen User (Super Admin). Sesuaikan deskripsi/izin bila perlu.",
      default_permissions: [],
      is_active: true,
    });
    console.log(
      `[auth] resolveOrCreateRoleRow: created roles.code=${codeKey} id=${created.id}`,
    );
    return { roleRow: created, error: null, roleAutoCreated: true };
  } catch (err) {
    const msg = String(err?.message || err);
    if (
      msg.includes("unique") ||
      msg.includes("Unique") ||
      msg.includes("duplicate")
    ) {
      const retry = await Role.findOne({ where: { code: codeKey } });
      if (retry)
        return { roleRow: retry, error: null, roleAutoCreated: false };
    }
    console.error("[resolveOrCreateRoleRow]", err);
    return {
      roleRow: null,
      error: `Gagal menyimpan role '${role}': ${msg}`,
      roleAutoCreated: false,
    };
  }
}

/** Jejak audit: role baru dibuat otomatis (agar tim IT bisa filter di DB / UI). */
async function logRoleAutoCreatedAudit({ roleRow, req, context, targetUserId }) {
  if (!roleRow?.id) return;
  await logAudit({
    modul: USER_MGMT_MODUL,
    entitas_id: String(roleRow.id),
    aksi: "ROLE_AUTO_CREATED",
    data_lama: null,
    data_baru: {
      role_id: roleRow.id,
      code: roleRow.code,
      name: roleRow.name,
      context,
      target_user_id: targetUserId != null ? String(targetUserId) : null,
    },
    pegawai_id: actorPegawaiId(req),
  });
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

    const tokenPayload = buildTokenPayloadFromUser(user, roleRow);
    const token = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

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
    await user.reload();

    const roleRow = await resolveRoleRowForLogin(user);
    const roleName = roleRow?.name || null;

    const canonicalFromRow = canonicalRoleFromRoleRow(roleRow, user.role);
    const roleToDashboard = {
      super_admin: "/dashboard/superadmin",
      sekretaris: "/dashboard/sekretaris",
      kepala_dinas: "/dashboard",
      gubernur: "/dashboard",
      kepala_bidang: "/dashboard",
      kepala_bidang_ketersediaan: "/dashboard/ketersediaan",
      kepala_bidang_distribusi: "/dashboard/distribusi",
      kepala_bidang_konsumsi: "/dashboard/konsumsi",
      kepala_uptd: "/dashboard/uptd",
      viewer: "/dashboard-publik",
      kasubag_umum_kepegawaian: "/dashboard/kasubag",
      kasubag: "/dashboard/kasubag",
      kasubbag: "/dashboard/kasubag",
      kasubbag_umum: "/dashboard/kasubag",
      kasubbag_kepegawaian: "/dashboard/kasubag",
      fungsional_perencana: "/dashboard/fungsional",
      fungsional_perencanaan: "/dashboard/fungsional",
      fungsional_keuangan: "/dashboard/fungsional",
      fungsional_analis: "/dashboard/fungsional",
      fungsional_ketersediaan: "/dashboard/fungsional",
      fungsional_distribusi: "/dashboard/fungsional",
      fungsional_konsumsi: "/dashboard/fungsional",
      fungsional_uptd_mutu: "/dashboard/fungsional",
      fungsional_uptd_teknis: "/dashboard/fungsional",
      ppk: "/dashboard/fungsional",
      jabatan_fungsional: "/dashboard/fungsional",
      pejabat_fungsional: "/dashboard/fungsional",
      fungsional: "/dashboard/fungsional",
      bendahara: "/dashboard/bendahara",
      bendahara_pengeluaran: "/dashboard/bendahara",
      bendahara_gaji: "/dashboard/bendahara",
      bendahara_barang: "/dashboard/bendahara",
      pelaksana: "/dashboard/pelaksana",
      staf_pelaksana: "/dashboard/pelaksana",
      pelaksana_ketersediaan: "/dashboard/pelaksana",
      pelaksana_distribusi: "/dashboard/pelaksana",
      pelaksana_konsumsi: "/dashboard/pelaksana",
      subbag_tata_usaha: "/dashboard/kasubag-uptd",
      kasubag_uptd: "/dashboard/kasubag-uptd",
      kasubbag_tata_usaha: "/dashboard/kasubag-uptd",
      seksi_manajemen_mutu: "/dashboard/kasi-uptd",
      seksi_manajemen_teknis: "/dashboard/kasi-uptd",
      kasi_uptd: "/dashboard/kasi-uptd",
      kasi_mutu: "/dashboard/kasi-uptd",
      kasi_teknis: "/dashboard/kasi-uptd",
      kasi_mutu_uptd: "/dashboard/kasi-uptd",
      kasi_teknis_uptd: "/dashboard/kasi-uptd",
      kasubbag_tu_uptd: "/dashboard/kasubag-uptd",
    };

    const plainUser = user.get?.({ plain: true }) ?? user;
    const canonicalRole = mergeCanonicalRoleWithUsersColumn(
      canonicalFromRow,
      plainUser.role,
      roleToDashboard,
    );

    const tokenPayload = {
      ...buildTokenPayloadFromUser(user, roleRow),
      role: canonicalRole,
    };
    const token = generateToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    let dashboardUrl = roleToDashboard[canonicalRole];
    if (!dashboardUrl) {
      const unitKerja = (user.unit_kerja || "").toLowerCase();
      if (unitKerja.includes("ketersediaan"))
        dashboardUrl = "/dashboard/ketersediaan";
      else if (unitKerja.includes("distribusi"))
        dashboardUrl = "/dashboard/distribusi";
      else if (unitKerja.includes("konsumsi"))
        dashboardUrl = "/dashboard/konsumsi";
      else if (unitKerja.includes("sekretariat"))
        dashboardUrl = "/dashboard/sekretaris";
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
          role: canonicalRole,
          role_id: user.role_id,
          unit_id: user.unit_id,
          unit_kerja: user.unit_kerja,
          jabatan: user.jabatan,
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

    const {
      roleRow,
      error: roleError,
      roleAutoCreated,
    } = await resolveOrCreateRoleRow({
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

    const pegawaiId = actorPegawaiId(req);
    if (roleAutoCreated && roleRow) {
      await logRoleAutoCreatedAudit({
        roleRow,
        req,
        context: "create_user",
        targetUserId: user.id,
      });
    }
    await logAudit({
      modul: USER_MGMT_MODUL,
      entitas_id: String(user.id),
      aksi: "CREATE",
      data_lama: null,
      data_baru: snapshotUserForAudit(user),
      pegawai_id: pegawaiId,
    });

    res.status(201).json({
      success: true,
      message: "User berhasil ditambahkan",
      data: created,
      meta:
        roleAutoCreated && roleRow
          ? {
              role_auto_created: {
                code: roleRow.code,
                name: roleRow.name,
              },
            }
          : undefined,
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

    const dataLama = snapshotUserForAudit(user);

    user.username = username ?? user.username;
    user.email = email ?? user.email;
    user.nama_lengkap = nama_lengkap ?? user.nama_lengkap;
    user.unit_kerja = unit_kerja ?? user.unit_kerja;
    user.unit_id = unit_id ?? user.unit_id ?? user.unit_kerja;
    user.nip = nip ?? user.nip;
    user.jabatan = jabatan ?? user.jabatan;

    let roleAutoUpdated = false;
    let resolvedRoleRow = null;
    // Resolve role_id safely if role_id or role provided
    if (role_id || role) {
      const {
        roleRow,
        error: roleError,
        roleAutoCreated,
      } = await resolveOrCreateRoleRow({
        role,
        role_id,
      });
      if (roleError) {
        return res.status(400).json({ success: false, message: roleError });
      }
      if (roleRow) {
        resolvedRoleRow = roleRow;
        roleAutoUpdated = !!roleAutoCreated;
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

    const pegawaiId = actorPegawaiId(req);
    if (roleAutoUpdated && resolvedRoleRow) {
      await logRoleAutoCreatedAudit({
        roleRow: resolvedRoleRow,
        req,
        context: "update_user",
        targetUserId: user.id,
      });
    }
    await logAudit({
      modul: USER_MGMT_MODUL,
      entitas_id: String(user.id),
      aksi: "UPDATE",
      data_lama: dataLama,
      data_baru: snapshotUserForAudit(user),
      pegawai_id: pegawaiId,
    });

    res.json({
      success: true,
      message: "User berhasil diupdate",
      data: updated,
      meta:
        roleAutoUpdated && resolvedRoleRow
          ? {
              role_auto_created: {
                code: resolvedRoleRow.code,
                name: resolvedRoleRow.name,
              },
            }
          : undefined,
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
    const snapshot = snapshotUserForAudit(user);
    const targetId = String(user.id);
    await logAudit({
      modul: USER_MGMT_MODUL,
      entitas_id: targetId,
      aksi: "DELETE",
      data_lama: snapshot,
      data_baru: null,
      pegawai_id: actorPegawaiId(req),
    });
    await user.destroy();
    res.json({ success: true, message: "User berhasil dihapus" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error menghapus user",
      error: error.message,
    });
  }
};

// Admin: Jejak audit Manajemen User (tabel audit_log, modul USER_MANAGEMENT)
export const getUserManagementAuditLog = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 40));
    const offset = (page - 1) * limit;

    const { count, rows } = await AuditLog.findAndCountAll({
      where: { modul: USER_MGMT_MODUL },
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    const rawIds = rows.map((r) => r.pegawai_id).filter(Boolean);
    const numericIds = [
      ...new Set(
        rawIds
          .map((id) => parseInt(String(id), 10))
          .filter((n) => Number.isFinite(n)),
      ),
    ];
    const actors =
      numericIds.length > 0
        ? await User.findAll({
            where: { id: { [Op.in]: numericIds } },
            attributes: ["id", "username", "nama_lengkap", "role"],
          })
        : [];
    const actorMap = new Map(actors.map((a) => [String(a.id), a]));

    const data = rows.map((r) => {
      const j = r.toJSON ? r.toJSON() : r;
      const a = actorMap.get(String(j.pegawai_id));
      return {
        ...j,
        pelaku_username: a?.username ?? null,
        pelaku_nama: a?.nama_lengkap ?? null,
        pelaku_role: a?.role ?? null,
      };
    });

    res.json({
      success: true,
      data,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit) || 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil jejak audit",
      error: error.message,
    });
  }
};

/** Jejak yang sudah dipindah ke audit_log_archive (retensi). */
export const getUserManagementAuditArchiveLog = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 40));
    const offset = (page - 1) * limit;

    const { count, rows } = await AuditLogArchive.findAndCountAll({
      where: { modul: USER_MGMT_MODUL },
      order: [["archived_at", "DESC"]],
      limit,
      offset,
    });

    const rawIds = rows.map((r) => r.pegawai_id).filter(Boolean);
    const numericIds = [
      ...new Set(
        rawIds
          .map((id) => parseInt(String(id), 10))
          .filter((n) => Number.isFinite(n)),
      ),
    ];
    const actors =
      numericIds.length > 0
        ? await User.findAll({
            where: { id: { [Op.in]: numericIds } },
            attributes: ["id", "username", "nama_lengkap", "role"],
          })
        : [];
    const actorMap = new Map(actors.map((a) => [String(a.id), a]));

    const data = rows.map((r) => {
      const j = r.toJSON ? r.toJSON() : r;
      const a = actorMap.get(String(j.pegawai_id));
      return {
        ...j,
        pelaku_username: a?.username ?? null,
        pelaku_nama: a?.nama_lengkap ?? null,
        pelaku_role: a?.role ?? null,
      };
    });

    res.json({
      success: true,
      data,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit) || 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengambil jejak arsip",
      error: error.message,
    });
  }
};

function csvEscapeCell(val) {
  if (val === null || val === undefined) return "";
  const s = typeof val === "object" ? JSON.stringify(val) : String(val);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/** Ekspor CSV jejak audit Manajemen User (UTF-8 BOM untuk Excel). */
export const exportUserManagementAuditCsv = async (req, res) => {
  try {
    const limit = Math.min(
      10000,
      Math.max(1, parseInt(req.query.limit, 10) || 5000),
    );
    const rows = await AuditLog.findAll({
      where: { modul: USER_MGMT_MODUL },
      order: [["created_at", "DESC"]],
      limit,
    });
    const header = [
      "id",
      "created_at",
      "aksi",
      "entitas_id",
      "pegawai_id",
      "data_lama_json",
      "data_baru_json",
    ];
    const lines = [header.join(",")];
    for (const r of rows) {
      const p = r.get({ plain: true });
      lines.push(
        [
          csvEscapeCell(p.id),
          csvEscapeCell(p.created_at),
          csvEscapeCell(p.aksi),
          csvEscapeCell(p.entitas_id),
          csvEscapeCell(p.pegawai_id),
          csvEscapeCell(p.data_lama == null ? "" : JSON.stringify(p.data_lama)),
          csvEscapeCell(p.data_baru == null ? "" : JSON.stringify(p.data_baru)),
        ].join(","),
      );
    }
    const bom = "\ufeff";
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="user-management-audit-${Date.now()}.csv"`,
    );
    res.send(bom + lines.join("\n"));
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal mengekspor CSV",
      error: error.message,
    });
  }
};

/** Retensi: pindahkan ke audit_log_archive + hapus dari audit_log. */
export const archiveUserManagementAuditRetention = async (req, res) => {
  try {
    const { olderThanDays } = req.body || {};
    const result = await archiveUserManagementAuditOlderThan({ olderThanDays });
    res.json({
      success: true,
      message: `Berhasil mengarsipkan ${result.moved} baris ke audit_log_archive`,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gagal menjalankan retensi arsip",
      error: error.message,
    });
  }
};
