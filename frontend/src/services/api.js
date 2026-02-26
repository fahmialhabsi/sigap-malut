import axios from "axios";

const api = axios.create({
  baseURL: process.env.VITE_API_BASE || "/api",
  timeout: 10000,
});

export function setAuthToken(token) {
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete api.defaults.headers.common["Authorization"];
}

export default api;
