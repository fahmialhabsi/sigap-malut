// services/apiClient.js
import axios from "axios";

const api = axios.create({
  baseURL: "/api", // pastikan backend Anda serve di /api
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor untuk menambahkan Authorization header jika ada token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
