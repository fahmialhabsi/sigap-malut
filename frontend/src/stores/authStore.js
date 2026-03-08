import { create } from "zustand";
import api from "../utils/api";
import { logAuditTrail } from "../utils/auditTrail";
import { roleIdToName } from "../utils/roleMap";

// Map unit_kerja names to specific role names for bidang-level accounts
const unitToRole = {
  "Bidang Distribusi": "kepala_bidang_distribusi",
  "Bidang Distribusi dan Cadangan Pangan": "kepala_bidang_distribusi",
  "Bidang Ketersediaan": "kepala_bidang_ketersediaan",
  "Bidang Ketersediaan dan Kerawanan Pangan": "kepala_bidang_ketersediaan",
  "Bidang Konsumsi": "kepala_bidang_konsumsi",
  "Bidang Konsumsi dan Keamanan Pangan": "kepala_bidang_konsumsi",
  Sekretariat: "sekretaris",
  "Sekretariat Dinas": "sekretaris",
  "Sekretariat Dinas Pangan": "sekretaris",
  UPTD: "kepala_uptd",
  "UPTD Balai Pengawasan Mutu Pangan dan Obat Hewan": "kepala_uptd",
};

// Generic role names that should be further refined using unit_kerja
const genericRoles = new Set([
  "kepala_bidang",
  "kepala_seksi",
  "pelaksana",
  "jabatan_fungsional",
  "auditor",
  "viewer",
]);

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Normalize a raw user payload from the backend so that role/roleName
 * is always a specific, RBAC-ready value and unit_kerja holds a human-
 * readable name rather than a UUID.
 */
export function normalizeUser(raw) {
  if (!raw) return raw;

  const normalized = { ...raw };

  // 1. Derive role name: prefer role_id mapping, then existing role string
  let roleName = raw.role || "";
  if (raw.role_id && roleIdToName[raw.role_id]) {
    roleName = roleIdToName[raw.role_id];
  }

  // 2. Normalize unit_kerja – if it looks like a UUID use alternate name fields
  let unitKerja = raw.unit_kerja || "";
  if (UUID_REGEX.test(unitKerja)) {
    unitKerja =
      raw.unitName ||
      raw.unit_name ||
      raw.nama_unit ||
      raw.bidang ||
      unitKerja;
  }

  // 3. If role is still generic, infer specific role from unit name
  if (genericRoles.has(roleName) && unitToRole[unitKerja]) {
    roleName = unitToRole[unitKerja];
  }

  normalized.role = roleName;
  normalized.roleName = roleName;
  normalized.unit_kerja = unitKerja;

  return normalized;
}

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isInitialized: false,

  login: async (email, password) => {
    try {
      // some tests expect payload field `username`; include both to be compatible
      const response = await api.post("/auth/login", {
        email,
        username: email,
        password,
      });
      const { user: rawUser, token } = response.data.data;
      const user = normalizeUser(rawUser);

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isInitialized: true,
      });

      logAuditTrail({ user, action: "login", detail: "User login" });
      return { success: true };
    } catch (error) {
      // Reset state on failed login
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isInitialized: true,
      });
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      logAuditTrail({
        user: null,
        action: "login_failed",
        detail: "Login gagal",
      });
      console.error("Login error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Login gagal",
      };
    }
  },

  logout: async () => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    logAuditTrail({ user, action: "logout", detail: "User logout" });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isInitialized: true,
    });
  },

  initAuth: () => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      try {
        const user = normalizeUser(JSON.parse(userStr));
        set({
          user,
          token,
          isAuthenticated: true,
          isInitialized: true,
        });
      } catch (error) {
        console.error("Parse user error:", error);
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isInitialized: true,
        });
      }
    } else {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isInitialized: true,
      });
    }
  },
}));

export default useAuthStore;
