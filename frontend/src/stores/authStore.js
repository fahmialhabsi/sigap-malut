import { create } from "zustand";
import api from "../utils/api";
import { logAuditTrail } from "../utils/auditTrail";
import { roleIdToName } from "../utils/roleMap";

const authStore = create((set) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isInitialized: false,

  login: async (emailOrUsername, password) => {
    try {
      const payload =
        emailOrUsername && String(emailOrUsername).includes("@")
          ? { email: emailOrUsername, password }
          : { username: emailOrUsername, password };

      const response = await api.post("/auth/login", payload);
      console.log("authStore.login: response", response?.data);

      const {
        user: rawUser,
        token,
        refreshToken,
        dashboardUrl,
        roleName,
      } = response.data.data;

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
        roleName: roleName || null, // "GUBERNUR", etc (from backend)
        dashboardUrl: dashboardUrl || null,
        role:
          rawUser?.role ||
          roleIdToName?.[rawUser?.role_id] ||
          inferRoleFromUnit() ||
          null,
      };

      // Persist auth
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

      logAuditTrail({ user, action: "login", detail: "User login" });

      // IMPORTANT: return backend `data` object (so caller can read data.dashboardUrl)
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error("authStore.login: error", error?.response?.data || error);

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
      refreshToken: null,
      isAuthenticated: false,
      isInitialized: true,
    });
  },

  initAuth: () => {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({
          user,
          token: token || null,
          refreshToken: refreshToken || null,
          isAuthenticated: !!token,
          isInitialized: true,
        });
      } catch (error) {
        console.error("Parse user error:", error);
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isInitialized: true,
        });
      }
    } else {
      set({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isInitialized: true,
      });
    }
  },
}));

export const useAuthStore = authStore;
export default useAuthStore;
