// services/apiClient.js
import axios from "axios";

// Sama seperti utils/api.js: gunakan process.env untuk kompatibilitas Jest.
const resolvedBaseURL =
  (typeof process !== "undefined" && process.env && process.env.VITE_API_URL) ||
  "/api";

const api = axios.create({
  baseURL: resolvedBaseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor untuk menambahkan Authorization header jika ada token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
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
    return Promise.reject(err);
  },
);

export default api;
