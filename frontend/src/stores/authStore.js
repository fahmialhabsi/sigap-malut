import create from 'zustand';
import axios from 'axios';
import { saveToken, clearToken, initAuth as initAuthUtil } from '../utils/auth';

const useAuthStore = create((set, get) => ({
  isAuthenticated: false,
  isInitialized: false,
  user: null,
  initAuth: () => {
    initAuthUtil();
    const token = localStorage.getItem('sigap_token');
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    set({ isInitialized: true, isAuthenticated: !!token, user });
  },
  login: async (email, password) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      if (res.data && res.data.token) {
        saveToken(res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user || {}));
        set({ isAuthenticated: true, user: res.data.user || {} });
        return { success: true };
      }
      return { success: false, message: res.data?.message || 'Login failed' };
    } catch (err) {
      return { success: false, message: err?.response?.data?.message || err.message };
    }
  },
  logout: async () => {
    clearToken();
    localStorage.removeItem('user');
    set({ isAuthenticated: false, user: null });
  },
}));

export default useAuthStore;
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
      // some tests expect payload field `username`; include both to be compatible
      const response = await api.post("/auth/login", {
        email,
        username: email,
        password,
      });
      const { user, token } = response.data.data;

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
        const user = JSON.parse(userStr);
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
