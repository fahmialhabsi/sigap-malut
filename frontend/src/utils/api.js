// src/utils/api.js
import axios from "axios";

// NOTE: Hindari penggunaan import.meta agar Jest (CJS) tidak error.
// Vite akan mengisi process.env.VITE_API_URL melalui define() di vite.config.js.
const resolvedBaseURL =
  (typeof process !== "undefined" && process.env && process.env.VITE_API_URL) ||
  "/api";

const api = axios.create({
  baseURL: resolvedBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
let _redirectingToLogin = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";

    // Auto-redirect ke login saat token expired (kecuali saat request login itu sendiri)
    if (status === 401 && !url.includes("/auth/login") && !_redirectingToLogin) {
      _redirectingToLogin = true;
      try {
        // Bersihkan token yang tidak valid
        localStorage.removeItem("token");
        // Import lazy untuk hindari circular dependency
        import("../stores/authStore").then(({ default: useAuthStore }) => {
          useAuthStore.getState().logout?.();
        });
      } catch {
        // Ignore store errors
      }
      // Redirect dengan pesan
      setTimeout(() => {
        window.location.href = "/login?reason=session_expired";
        _redirectingToLogin = false;
      }, 100);
    }

    if (status === 403) {
      console.warn("[API] Akses ditolak (403) — role tidak punya izin:", url);
    }

    return Promise.reject(error);
  },
);

export default api;
