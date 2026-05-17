import axios from "axios";

function resolveBasePath(baseURL) {
  const raw = String(baseURL || "");
  if (!raw) return "";

  try {
    return new URL(raw, "http://localhost").pathname.replace(/\/+$/, "");
  } catch {
    return raw.replace(/\/+$/, "");
  }
}

function normalizeUrlAgainstBase(url, baseURL) {
  if (typeof url !== "string") return url;
  if (/^(?:[a-z]+:)?\/\//i.test(url)) return url;

  const basePath = resolveBasePath(baseURL);
  if (basePath.endsWith("/api") && /^\/api(?:\/|$)/.test(url)) {
    // Pertahankan prefix /api agar tidak ter-strip; baseURL juga /api
    return url;
  }

  return url;
}

function readViteEnv() {
  try {
    return Function(
      "return typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : undefined",
    )();
  } catch {
    return undefined;
  }
}

const resolvedBaseURL = (() => {
  const env = readViteEnv();
  if (env?.VITE_API_URL) return env.VITE_API_URL;
  if (env?.VITE_API_BASE) return env.VITE_API_BASE;
  try {
    if (typeof process !== "undefined" && process.env?.VITE_API_URL) {
      return process.env.VITE_API_URL;
    }
  } catch {
    /* ignore */
  }
  return "/api";
})();

const api = axios.create({
  baseURL: resolvedBaseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Memastikan struktur defaults axios ada (browser + lingkungan uji dengan mock axios).
 */
export function ensureAuthApiDefaults() {
  if (!api.defaults) api.defaults = {};
  if (!api.defaults.headers) api.defaults.headers = {};
  if (!api.defaults.headers.common) api.defaults.headers.common = {};
  return api.defaults.headers.common;
}

ensureAuthApiDefaults();

api.interceptors.request.use((config) => {
  const base = config.baseURL ?? api.defaults?.baseURL ?? "";
  config.url = normalizeUrlAgainstBase(config.url, base);
  try {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    /* ignore */
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } catch {
        /* ignore */
      }
      try {
        window.location.href = "/login";
      } catch {
        /* ignore di lingkungan non-browser */
      }
    }
    return Promise.reject(error);
  },
);

export function setAuthToken(token) {
  const common = ensureAuthApiDefaults();
  if (token) common.Authorization = `Bearer ${token}`;
  else delete common.Authorization;
}

export default api;
