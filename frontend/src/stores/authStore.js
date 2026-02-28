import { create } from "zustand";
import api from "../utils/api";
import { logAuditTrail } from "../utils/auditTrail";

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isInitialized: false,

  login: async (email, password) => {
    try {
      const identifier = (email || "").trim();
      const payload = identifier.includes("@")
        ? { email: identifier, password }
        : { username: identifier, password };
      const response = await api.post("/auth/login", payload);
      // Backend returns { access, refresh, user }
      // Debug: log backend response shape to help diagnose redirect issues
      // eslint-disable-next-line no-console
      console.debug("authStore.login response.data:", response.data);
      const { access, refresh, user, redirect } = response.data || {};

      if (access) localStorage.setItem("token", access);
      if (refresh) localStorage.setItem("refresh", refresh);
      if (user) localStorage.setItem("user", JSON.stringify(user));

      set({
        user: user || null,
        token: access || null,
        isAuthenticated: !!access,
        isInitialized: true,
      });

      logAuditTrail({ user, action: "login", detail: "User login" });
      return { success: true, redirect };
    } catch (error) {
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
        const user = JSON.parse(userStr);
        set({ user, token, isAuthenticated: true, isInitialized: true });
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
