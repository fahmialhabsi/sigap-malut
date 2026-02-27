import axios from "axios";

const TOKEN_KEY = "sigap_token";

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
  axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  delete axios.defaults.headers.common["Authorization"];
}

export function initAuth() {
  const t = getToken();
  if (t) axios.defaults.headers.common["Authorization"] = `Bearer ${t}`;
}
