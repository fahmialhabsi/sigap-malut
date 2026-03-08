import React, { createContext, useState, useEffect } from "react";
import api, { setAuthToken } from "../services/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Baca token dari key yang mungkin berbeda-beda (kompatibilitas)
    const token =
      localStorage.getItem("access") || localStorage.getItem("token");
    if (token) {
      setAuthToken(token);
      // juga set default header pada axios instance bila diperlukan
      try {
        if (api && api.defaults && api.defaults.headers) {
          api.defaults.headers.common = api.defaults.headers.common || {};
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        }
      } catch (err) {
        // noop
      }
    }
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  async function login(username, password) {
    // Panggil backend
    const r = await api.post("/auth/login", { username, password });

    // Backend/response shape bisa bervariasi: coba ambil access/refresh/user dari beberapa path
    const resp = r.data ?? {};
    const payload = resp.data ?? resp;
    const access = payload.access || payload.token || resp.access || resp.token;
    const refresh =
      payload.refresh ||
      payload.refreshToken ||
      resp.refresh ||
      resp.refreshToken;
    const returnedUser =
      payload.user || payload.data?.user || resp.user || payload;

    // Set token di util dan localStorage (tulis ke beberapa key untuk kompatibilitas)
    setAuthToken(access);
    if (access) {
      localStorage.setItem("access", access);
      localStorage.setItem("token", access); // kompatibilitas dengan authStore
    }
    if (refresh) {
      localStorage.setItem("refresh", refresh);
      localStorage.setItem("refreshToken", refresh); // kompatibilitas
    }
    if (returnedUser) {
      localStorage.setItem("user", JSON.stringify(returnedUser));
      setUser(returnedUser);
    }

    // Pastikan axios instance juga diberi header Authorization
    try {
      if (access && api && api.defaults && api.defaults.headers) {
        api.defaults.headers.common = api.defaults.headers.common || {};
        api.defaults.headers.common["Authorization"] = `Bearer ${access}`;
      }
    } catch (err) {
      // noop
    }

    return returnedUser;
  }

  function logout() {
    setAuthToken(null);
    // Hapus semua key yang mungkin digunakan oleh mekanisme yang berbeda
    localStorage.removeItem("access");
    localStorage.removeItem("token");
    localStorage.removeItem("refresh");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);

    // Hapus header axios jika ada
    try {
      if (
        api &&
        api.defaults &&
        api.defaults.headers &&
        api.defaults.headers.common
      ) {
        delete api.defaults.headers.common["Authorization"];
      }
    } catch (err) {
      // noop
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
