import React, { createContext, useState, useEffect } from "react";
import api, { setAuthToken } from "../services/api";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      setAuthToken(token);
    }
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  async function login(username, password) {
    const r = await api.post("/auth/login", { username, password });
    setAuthToken(r.data.access);
    localStorage.setItem("access", r.data.access);
    localStorage.setItem("refresh", r.data.refresh);
    localStorage.setItem("user", JSON.stringify(r.data.user));
    setUser(r.data.user);
    return r.data.user;
  }

  function logout() {
    setAuthToken(null);
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
