// services/apiClient.js
import axios from "axios";

const resolvedBaseURL =
  import.meta?.env?.VITE_API_URL ||
  (typeof process !== "undefined" && process.env && process.env.VITE_API_URL) ||
  "/api";

const api = axios.create({
  baseURL: resolvedBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// helper: baca token dari beberapa key
function getStoredToken() {
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    null
  );
}

// optional named export to set/clear Authorization header programmatically
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers = api.defaults.headers || {};
    api.defaults.headers.common = api.defaults.headers.common || {};
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    // persist to storage for interceptor compatibility
    try {
      localStorage.setItem("token", token);
      localStorage.setItem("access_token", token);
    } catch (e) {
      /* ignore */
    }
  } else {
    if (api.defaults && api.defaults.headers && api.defaults.headers.common) {
      delete api.defaults.headers.common.Authorization;
    }
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("access_token");
    } catch (e) {
      /* ignore */
    }
  }
}

// Interceptor untuk menambahkan Authorization header jika ada token
api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Warn if a response returns HTML (likely a dev-server index.html fallback)
api.interceptors.response.use(
  (resp) => {
    try {
      const ct = resp.headers && resp.headers["content-type"];
      if (ct && typeof ct === "string" && ct.includes("text/html")) {
        console.warn(
          "apiClient: response is HTML (possible dev-server fallback). URL:",
          resp.config && resp.config.url,
        );
      }
    } catch (e) {
      /* ignore */
    }
    return resp;
  },
  (err) => {
    // QUICKFIX: if backend returns specific 404 about missing 'auth' module,
    // return a fallback success response using the locally-stored user.
    try {
      const status = err?.response?.status;
      const data = err?.response?.data;
      const url = err?.config?.url || "";
      if (
        status === 404 &&
        data &&
        typeof data.message === "string" &&
        data.message.includes("Modul/table 'auth' tidak ditemukan")
      ) {
        // Only apply fallback for the auth/profile endpoint (safety)
        if (url && url.includes("/auth/profile")) {
          const stored = localStorage.getItem("user");
          let user = null;
          try {
            user = stored ? JSON.parse(stored) : null;
          } catch (e) {
            user = null;
          }
          // build a response shape similar to successful backend: { data: { success:true, data: user } }
          return Promise.resolve({
            data: { success: true, data: user },
            status: 200,
            statusText: "OK (fallback)",
            headers: err.response.headers || {},
            config: err.config,
          });
        }
      }
    } catch (e) {
      /* ignore fallback errors */
    }
    return Promise.reject(err);
  },
);

export default api;
