import { create } from "zustand";
import api from "../utils/api";

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: async (username, password) => {
    try {
      const response = await api.post("/auth/login", { username, password });
      const { user, token } = response.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
      });

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Login gagal",
      };
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({
      user: null,
      token: null,
      isAuthenticated: false,
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
        });
      } catch (error) {
        console.error("Parse user error:", error);
      }
    }
  },
}));

export default useAuthStore;
