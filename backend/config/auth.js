import bcrypt from "bcrypt";

// JWT Configuration
export const jwtConfig = {
  secret:
    process.env.JWT_SECRET ||
    "sigap_malut_secret_key_2026_change_in_production",
  refreshSecret:
    process.env.JWT_REFRESH_SECRET || "sigap_malut_refresh_secret_2026",
  expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  refreshExpiresIn: "30d",
  issuer: "SIGAP Malut",
  audience: "sigap-malut-users",
};

// Password hashing configuration
export const passwordConfig = {
  saltRounds: parseInt(process.env.BCRYPT_ROUNDS) || 10,
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false,
};

// Session configuration
export const sessionConfig = {
  maxActiveSessions: 5,
  sessionTimeout: 3600000, // 1 hour in milliseconds
  refreshTokenRotation: true,
};

// Login attempt configuration
export const loginAttemptConfig = {
  maxAttempts: 5,
  lockoutDuration: 900000, // 15 minutes in milliseconds
  resetAfter: 3600000, // 1 hour
};

// Password utilities
export const hashPassword = async (password) => {
  if (!password) {
    throw new Error("Password is required");
  }
  return await bcrypt.hash(password, passwordConfig.saltRounds);
};

export const comparePassword = async (password, hashedPassword) => {
  if (!password || !hashedPassword) {
    return false;
  }
  return await bcrypt.compare(password, hashedPassword);
};

export const validatePassword = (password) => {
  const errors = [];

  if (!password) {
    errors.push("Password wajib diisi");
    return { isValid: false, errors };
  }

  if (password.length < passwordConfig.minLength) {
    errors.push(`Password minimal ${passwordConfig.minLength} karakter`);
  }

  if (passwordConfig.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("Password harus mengandung minimal 1 huruf besar");
  }

  if (passwordConfig.requireLowercase && !/[a-z]/.test(password)) {
    errors.push("Password harus mengandung minimal 1 huruf kecil");
  }

  if (passwordConfig.requireNumbers && !/[0-9]/.test(password)) {
    errors.push("Password harus mengandung minimal 1 angka");
  }

  if (
    passwordConfig.requireSpecialChars &&
    !/[!@#$%^&*(),.?":{}|<>]/.test(password)
  ) {
    errors.push("Password harus mengandung minimal 1 karakter spesial");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// User roles hierarchy
export const rolesHierarchy = {
  super_admin: 10,
  kepala_dinas: 9,
  sekretaris: 8,
  kepala_bidang: 8,
  kepala_uptd: 8,
  kasubbag: 7,
  kasubbag_umum: 7,
  kasubbag_kepegawaian: 7,
  kasubbag_perencanaan: 7,
  kasi_uptd: 7,
  kasubbag_tu_uptd: 7,
  kasi_mutu_uptd: 7,
  kasi_teknis_uptd: 7,
  fungsional: 6,
  fungsional_perencana: 6,
  fungsional_analis: 6,
  pelaksana: 5,
  guest: 0,
};

// Permissions per role
export const rolePermissions = {
  super_admin: ["*"], // All permissions
  kepala_dinas: ["read:all", "approve:all", "report:all"],
  sekretaris: [
    "read:all",
    "write:sekretariat",
    "approve:sekretariat",
    "consolidate:all",
  ],
  kepala_bidang: ["read:own_unit", "write:own_unit", "approve:own_unit"],
  kepala_uptd: ["read:uptd", "write:uptd", "approve:uptd"],
  kasubbag: ["read:sekretariat", "write:sekretariat", "verify:sekretariat"],
  kasi_uptd: ["read:uptd", "write:uptd", "verify:uptd"],
  fungsional: ["read:own_unit", "write:own_unit", "verify:own_unit"],
  pelaksana: ["read:own_data", "write:own_data"],
  guest: ["read:public"],
};

export default {
  jwtConfig,
  passwordConfig,
  sessionConfig,
  loginAttemptConfig,
  hashPassword,
  comparePassword,
  validatePassword,
  rolesHierarchy,
  rolePermissions,
};
