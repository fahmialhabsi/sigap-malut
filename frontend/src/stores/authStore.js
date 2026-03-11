// frontend/src/stores/authStore.js

import { create } from "zustand";
import api from "../utils/api";
import { logAuditTrail } from "../utils/auditTrail";
import { roleIdToName } from "../utils/roleMap"; // <- sudah ada
import unitNameToId from "../utils/unitMap"; // <- import untuk mapping unit

// Import helper untuk set Authorization header pada axios instance utils/api
import { setAuthToken as setApiAuthToken } from "../utils/api";

// Build inverse mapping unitId -> unitName (lowercased keys for tolerant lookup)
const unitIdToName = Object.entries(unitNameToId || {}).reduce(
  (acc, [name, id]) => {
    if (id) acc[String(id).toLowerCase()] = name;
    return acc;
  },
  {},
);

// Helper: normalisasi objek user agar frontend konsisten menggunakan field yang sama
function normalizeUser(raw) {
  if (!raw) return null;
  const user = { ...raw };

  // role: jika backend mengirim role (string) gunakan itu;
  // jika hanya ada role_id (UUID) mapping ke nama role via roleIdToName
  if (!user.role) {
    const fromRoleId = user.role_id && roleIdToName?.[String(user.role_id)];
    user.role = fromRoleId || user.role || null;
  }

  // roleName: variasi lain kalau ada
  if (!user.roleName) {
    user.roleName = user.roleName || user.role || null;
  }

  // unit_kerja: konsistenkan dari unit_id / unit / unitName / unit_kerja
  let unitVal =
    user.unit_kerja ||
    user.unit ||
    user.unit_id ||
    user.unitName ||
    user.unit_name ||
    null;

  // Jika unitVal adalah UUID (atau adalah salah satu id dalam mapping), convert ke display name
  if (unitVal) {
    const lower = String(unitVal).toLowerCase();
    if (unitIdToName[lower]) {
      // gunakan display name seperti "Bidang Distribusi"
      unitVal = unitIdToName[lower];
    }
  }

  user.unit_kerja = unitVal;

  // jabatan: konsistenkan dari beberapa kemungkinan field
  user.jabatan = user.jabatan || user.position || user.role_title || null;

  return user;
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

      // backend response shape: response.data.data.{ user, token, roleName } atau data.data
      const payload = response.data.data || response.data || {};
      const rawUser = payload.user || payload;
      const token = payload.token || payload?.access_token || null;
      const roleNameFromResp = payload.roleName || payload.role_name || null;

      let user = normalizeUser(rawUser);

      // Jika backend mengirim roleName terpisah, pastikan kita menyimpannya ke user
      if (roleNameFromResp && user) {
        // normalisasi casing ke nilai yang konsisten (frontend memakai role / roleName)
        user.roleName = user.roleName || roleNameFromResp;
        // juga set user.role jika belum ada dan roleName bisa dipakai langsung
        user.role = user.role || roleNameFromResp;
      }

      // persist token + user to localStorage (key 'token' used by apiClient interceptor)
      if (token) {
        try {
          localStorage.setItem("token", token);
          // also store access_token for compatibility with other code that may use it
          localStorage.setItem("access_token", token);
          // set Authorization header on utils/api axios instance
          setApiAuthToken(token);
        } catch (e) {
          console.warn("Failed to persist token or set axios header:", e);
        }
      } else {
        // ensure any previous token storage is cleared if login returns no token
        localStorage.removeItem("token");
        localStorage.removeItem("access_token");
        try {
          setApiAuthToken(null);
        } catch (e) {
          /* ignore */
        }
      }

      try {
        localStorage.setItem("user", JSON.stringify(user));
      } catch (e) {
        console.warn("Failed to persist user to localStorage:", e);
      }

      set({
        user,
        token,
        isAuthenticated: !!token,
        isInitialized: true,
      });

      logAuditTrail({ user, action: "login", detail: "User login" });
      return { success: true, data: payload };
    } catch (error) {
      // Reset state on failed login
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isInitialized: true,
      });
      localStorage.removeItem("token");
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      try {
        setApiAuthToken(null);
      } catch (e) {
        /* ignore */
      }
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
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    try {
      setApiAuthToken(null);
    } catch (e) {
      /* ignore */
    }
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isInitialized: true,
    });
  },

  initAuth: () => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("access_token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      try {
        const raw = JSON.parse(userStr);
        const user = normalizeUser(raw);
        // ensure axios instance has Authorization header
        try {
          setApiAuthToken(token);
        } catch (e) {
          console.debug(
            "setApiAuthToken failed during initAuth:",
            e?.message || e,
          );
        }
        set({
          user,
          token,
          isAuthenticated: true,
          isInitialized: true,
        });
      } catch (error) {
        console.error("Parse user error:", error);
        try {
          setApiAuthToken(null);
        } catch (e) {
          /* ignore */
        }
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isInitialized: true,
        });
      }
    } else {
      try {
        setApiAuthToken(null);
      } catch (e) {
        /* ignore */
      }
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
