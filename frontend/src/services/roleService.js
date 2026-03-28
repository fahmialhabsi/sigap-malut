// frontend/src/services/roleService.js
import api from "./apiClient";

export async function fetchRoles() {
  const res = await api.get("/role?limit=1000");
  if (res.data && res.data.success && Array.isArray(res.data.data)) {
    return res.data.data;
  }
  throw new Error("Gagal mengambil data role dari backend");
}
