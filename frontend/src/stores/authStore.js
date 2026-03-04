import { create } from "zustand";
import api from "../utils/api";
import { logAuditTrail } from "../utils/auditTrail";
import { roleIdToName } from "../utils/roleMap";

const authStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isInitialized: false,

  login: async (email, password) => {
    try {
      // some tests expect payload field `username`; include both to be compatible
      // If the identifier looks like an email (contains '@'), send as `email`.
      // Otherwise send as `username` to support username-based logins.
      const payload =
        email && String(email).includes("@")
          ? { email, password }
          : { username: email, password };

      const response = await api.post("/auth/login", payload);
      console.log("authStore.login: response", response?.data);
      const { user: rawUser, token, refreshToken } = response.data.data;
      const unitVal =
        rawUser?.unit_kerja || rawUser?.unit_id || rawUser?.unit || "";
      const unit = unitVal ? String(unitVal).toLowerCase() : "";
      const inferRoleFromUnit = () => {
        if (!unit) return null;
        if (unit.includes("ketersediaan")) return "kepala_bidang_ketersediaan";
        if (unit.includes("distribusi")) return "kepala_bidang_distribusi";
        if (unit.includes("konsumsi")) return "kepala_bidang_konsumsi";
        if (unit.includes("sekretariat")) return "sekretaris";
        if (unit.includes("uptd")) return "kepala_uptd";
        return null;
      };

      const user = {
        ...rawUser,
        role:
          rawUser.role ||
          roleIdToName[rawUser.role_id] ||
          inferRoleFromUnit() ||
          null,
      };

      if (token) localStorage.setItem("token", token);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user", JSON.stringify(user));

      set({
        user,
        token: token || null,
        refreshToken: refreshToken || null,
        isAuthenticated: !!token,
        isInitialized: true,
      });

      // login: store updated

      logAuditTrail({ user, action: "login", detail: "User login" });
      return { success: true, data: response.data };
    } catch (error) {
      console.error("authStore.login: error", error?.response?.data || error);
      // Reset state on failed login
      set({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isInitialized: true,
      });
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
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
        error: error.response?.data || null,
      };
    }
  },

  logout: async () => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    logAuditTrail({ user, action: "logout", detail: "User logout" });
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
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
    const refreshToken = localStorage.getItem("refreshToken");
    const userStr = localStorage.getItem("user");
    // initAuth: initialize from localStorage

    if (token && userStr) {
      try {
        const rawUser = JSON.parse(userStr);
        const unitVal =
          rawUser?.unit_kerja || rawUser?.unit_id || rawUser?.unit || "";
        const unit = unitVal ? String(unitVal).toLowerCase() : "";
        const inferRoleFromUnit = () => {
          if (!unit) return null;
          if (unit.includes("ketersediaan"))
            return "kepala_bidang_ketersediaan";
          if (unit.includes("distribusi")) return "kepala_bidang_distribusi";
          if (unit.includes("konsumsi")) return "kepala_bidang_konsumsi";
          if (unit.includes("sekretariat")) return "sekretaris";
          if (unit.includes("uptd")) return "kepala_uptd";
          return null;
        };

        const user = {
          ...rawUser,
          role:
            rawUser.role ||
            roleIdToName[rawUser.role_id] ||
            inferRoleFromUnit() ||
            null,
        };

        set({
          user,
          token: token || null,
          refreshToken: refreshToken || null,
          isAuthenticated: !!token,
          isInitialized: true,
        });
        // loaded user from localStorage
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

// expose the raw store instance and the hook
export const useAuthStore = authStore;

export default useAuthStore;
