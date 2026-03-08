import { unitNameToId } from "./unitMap";
import { roleIdToName } from "./roleMap";

// Build inverse mapping: UUID → unit display name
const idToUnitName = Object.entries(unitNameToId).reduce(
  (acc, [name, id]) => {
    acc[id] = name;
    return acc;
  },
  {}
);

const dashboardMapping = {
  super_admin: "/dashboard/superadmin",
  kepala_dinas: "/dashboard/superadmin",
  Sekretariat: "/dashboard/sekretariat",
  "Bidang Ketersediaan": "/dashboard/ketersediaan",
  "Bidang Distribusi": "/dashboard/distribusi",
  "Bidang Konsumsi": "/dashboard/konsumsi",
  UPTD: "/dashboard/uptd",
  kepala_bidang_ketersediaan: "/dashboard/ketersediaan",
  kepala_bidang_distribusi: "/dashboard/distribusi",
  kepala_bidang_konsumsi: "/dashboard/konsumsi",
  "Bidang Distribusi dan Cadangan Pangan": "/dashboard/distribusi",
};

/**
 * Determines the correct dashboard path for a logged-in user.
 *
 * Resolution order:
 *  1. user.role (string name)
 *  2. user.roleName (string name)
 *  3. user.role_id (UUID resolved via roleIdToName)
 *  4. user.unit_kerja / user.unit_id / user.unit
 *     - if value is a UUID present in idToUnitName, it is resolved to the
 *       display name before performing the existing substring checks
 *  5. user.jabatan substring check
 *  6. user.email / user.username substring check
 *  7. Fallback: "/dashboard"
 *
 * @param {object|null} user - user object stored in localStorage after login
 * @returns {string} dashboard path
 */
export function getDashboardPath(user) {
  if (!user) return "/dashboard";

  // 1. Role as a string name
  if (user.role && dashboardMapping[user.role]) {
    return dashboardMapping[user.role];
  }

  // 2. roleName field
  if (user.roleName && dashboardMapping[user.roleName]) {
    return dashboardMapping[user.roleName];
  }

  // 3. role_id UUID → resolve to name
  if (user.role_id && roleIdToName[user.role_id]) {
    const roleName = roleIdToName[user.role_id];
    if (dashboardMapping[roleName]) {
      return dashboardMapping[roleName];
    }
  }

  // 4. Unit value – resolve UUID to display name if possible
  const unitRaw = user.unit_kerja || user.unit_id || user.unit;
  const unitResolved = idToUnitName[unitRaw] || unitRaw;

  if (unitResolved) {
    if (dashboardMapping[unitResolved]) {
      return dashboardMapping[unitResolved];
    }
    const unitLower = unitResolved.toLowerCase();
    if (unitLower.includes("distribusi")) return "/dashboard/distribusi";
    if (unitLower.includes("ketersediaan")) return "/dashboard/ketersediaan";
    if (unitLower.includes("konsumsi")) return "/dashboard/konsumsi";
    if (unitLower.includes("sekretariat")) return "/dashboard/sekretariat";
    if (unitLower.includes("uptd")) return "/dashboard/uptd";
  }

  // 5. jabatan substring check
  if (user.jabatan) {
    const jabatanLower = user.jabatan.toLowerCase();
    if (jabatanLower.includes("distribusi")) return "/dashboard/distribusi";
    if (jabatanLower.includes("ketersediaan")) return "/dashboard/ketersediaan";
    if (jabatanLower.includes("konsumsi")) return "/dashboard/konsumsi";
  }

  // 6. email / username substring check
  const identifier = (user.email || user.username || "").toLowerCase();
  if (identifier.includes("distribusi")) return "/dashboard/distribusi";
  if (identifier.includes("ketersediaan")) return "/dashboard/ketersediaan";
  if (identifier.includes("konsumsi")) return "/dashboard/konsumsi";

  return "/dashboard";
}
