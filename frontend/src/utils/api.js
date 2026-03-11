// frontend/src/utils/api.js

import axios from "axios";

const api = axios.create({
  baseURL: import.meta?.env?.VITE_API_BASE || "/api",
  timeout: 10000,
});

// Named export: helper untuk set/clear Authorization header pada instance ini
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers = api.defaults.headers || {};
    api.defaults.headers.common = api.defaults.headers.common || {};
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    if (api.defaults && api.defaults.headers && api.defaults.headers.common) {
      delete api.defaults.headers.common["Authorization"];
    }
  }
}

export default api;
