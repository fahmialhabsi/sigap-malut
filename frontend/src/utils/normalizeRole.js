// Normalisasi role untuk UI — harus selaras dengan authStore (spasi/hyphen → underscore).
import { roleIdToName } from "./roleMap";

/**
 * @param {object|null|undefined} user — objek user dari authStore / localStorage
 * @returns {string|null} kunci role mis. super_admin, kasubag_umum_kepegawaian
 */
export function normalizeRoleKey(user) {
  if (!user) return null;
  const raw =
    (user.roleName && String(user.roleName)) ||
    (user.role && String(user.role)) ||
    roleIdToName?.[String(user.role_id)] ||
    null;
  if (raw == null || raw === "") return null;
  return String(raw).trim().toLowerCase().replace(/[\s-]+/g, "_");
}
