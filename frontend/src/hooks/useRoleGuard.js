/**
 * useRoleGuard.js
 *
 * Hook terpusat untuk validasi akses role di semua dashboard.
 * Menggantikan 3 pola berbeda yang tersebar di berbagai dashboard.
 *
 * Penggunaan:
 *   const { allowed, redirect } = useRoleGuard(["kepala_dinas", "super_admin"]);
 *   if (!allowed) return <Navigate to={redirect} replace />;
 */

import useAuthStore from "../stores/authStore";
import { roleIdToName } from "../utils/roleMap";

function normalizeRole(user) {
  if (!user) return null;
  return (
    (user.roleName && String(user.roleName).toLowerCase()) ||
    user.role ||
    roleIdToName?.[user.role_id] ||
    roleIdToName?.[String(user.role_id)] ||
    null
  );
}

/**
 * @param {string[]} allowedRoles - Daftar role yang diizinkan mengakses halaman ini.
 *                                  Kosongkan ([]) untuk halaman publik tanpa autentikasi.
 * @returns {{ allowed: boolean, redirect: string, user: object|null, role: string|null }}
 */
export default function useRoleGuard(allowedRoles = []) {
  const user = useAuthStore((s) => s.user);
  const role = normalizeRole(user);

  // Halaman publik — selalu diizinkan
  if (allowedRoles.length === 0) {
    return { allowed: true, redirect: null, user, role };
  }

  // Belum login
  if (!user) {
    return { allowed: false, redirect: "/login", user: null, role: null };
  }

  // Role tidak termasuk daftar
  if (!allowedRoles.includes(role)) {
    return { allowed: false, redirect: "/unauthorized", user, role };
  }

  return { allowed: true, redirect: null, user, role };
}
