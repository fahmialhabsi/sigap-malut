// src/utils/api.js
import axios from "axios";

const resolvedBaseURL = (() => {
  try {
    // Vite exposes env via import.meta.env at build time
    if (
      typeof import.meta !== "undefined" &&
      import.meta.env &&
      import.meta.env.VITE_API_URL
    )
      return import.meta.env.VITE_API_URL;
  } catch (e) {
    // ignore
  }
  try {
    if (
      typeof process !== "undefined" &&
      process.env &&
      process.env.VITE_API_URL
    )
      return process.env.VITE_API_URL;
  } catch (e) {
    // ignore
  }
  return "/api";
})();

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
  (response) => {
    try {
      console.log(
        "API Response:",
        response.status,
        response.config.url,
        response.data,
      );
    } catch (e) {
      console.log("API Response (debug) failed to stringify", e);
    }
    return response;
  },
  (error) => {
    console.error("API Error: full error:", error);
    console.error("API Error: response:", error.response);
    if (error.response) {
      console.error(
        "API Error: status/data:",
        error.response.status,
        error.response.data,
      );
    } else if (error.request) {
      console.error("API Error: no response received, request:", error.request);
    }

    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
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
