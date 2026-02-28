// src/utils/api.js
import axios from "axios";

const api = axios.create({
  baseURL:
    (typeof process !== "undefined" &&
      process.env &&
      process.env.VITE_API_URL) ||
    "http://localhost:5050/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    console.log("API Request:", config.method.toUpperCase(), config.url); // DEBUG
    console.log("Token:", token ? "EXISTS" : "NOT FOUND"); // DEBUG

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
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.status, error.response?.data);

    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // assign a simple location object to make tests deterministic
      try {
        window.location = { href: "/login" };
      } catch (e) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
