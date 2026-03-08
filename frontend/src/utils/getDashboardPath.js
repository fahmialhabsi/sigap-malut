// frontend/src/utils/getDashboardPath.js
// Infers the correct dashboard path for a logged-in user.
// Handles both human-readable unit names and UUID-stored unit identifiers.

import { roleIdToName } from "./roleMap";
import { unitNameToId } from "./unitMap";

// Build inverse mapping: UUID → display name
const idToUnitName = Object.entries(unitNameToId).reduce(
  (acc, [name, id]) => {
    acc[id] = name;
    return acc;
  },
  {},
);

// Mapping of resolved names/roles to dashboard paths
const dashboardMapping = {
  super_admin: "/dashboard/superadmin",
  kepala_dinas: "/dashboard/superadmin",
  sekretaris: "/dashboard/sekretariat",
  Sekretariat: "/dashboard/sekretariat",
  kepala_bidang_ketersediaan: "/dashboard/ketersediaan",
  kepala_bidang_distribusi: "/dashboard/distribusi",
  kepala_bidang_konsumsi: "/dashboard/konsumsi",
  "Bidang Ketersediaan": "/dashboard/ketersediaan",
  "Bidang Distribusi": "/dashboard/distribusi",
  "Bidang Distribusi dan Cadangan Pangan": "/dashboard/distribusi",
  "Bidang Konsumsi": "/dashboard/konsumsi",
  UPTD: "/dashboard/uptd",
};

/**
 * Resolve a unit value that may be stored as a UUID to its human-readable name.
 * If the value is not a known UUID, it is returned unchanged.
 *
 * @param {string|null|undefined} unitRaw
 * @returns {string}
 */
function resolveUnit(unitRaw) {
  if (!unitRaw) return "";
  return idToUnitName[unitRaw] || unitRaw;
}

/**
 * Infer the correct dashboard path from a substring of a resolved value.
 *
 * @param {string} val - Lower-cased resolved value to check
 * @returns {string|null}
 */
function inferFromSubstring(val) {
  if (!val) return null;
  const lower = val.toLowerCase();
  if (lower.includes("distribusi")) return "/dashboard/distribusi";
  if (lower.includes("ketersediaan")) return "/dashboard/ketersediaan";
  if (lower.includes("konsumsi")) return "/dashboard/konsumsi";
  if (lower.includes("sekretariat")) return "/dashboard/sekretariat";
  if (lower.includes("uptd")) return "/dashboard/uptd";
  if (lower.includes("super_admin") || lower.includes("superadmin"))
    return "/dashboard/superadmin";
  if (lower.includes("kepala_dinas") || lower.includes("kepala dinas"))
    return "/dashboard/superadmin";
  return null;
}

/**
 * Given a user object (from localStorage or auth store), return the dashboard
 * path the user should be redirected to after login.
 *
 * Resolution order:
 *  1. user.role → direct mapping
 *  2. user.roleName → direct mapping
 *  3. user.role_id → roleIdToName → direct mapping / substring
 *  4. user.unit_kerja / user.unit_id / user.unit → resolve UUID → direct mapping / substring
 *  5. user.jabatan → substring
 *  6. user.email / user.username → substring
 *  7. Default: "/dashboard"
 *
 * @param {object|null} user
 * @returns {string}
 */
export function getDashboardPath(user) {
  if (!user) return "/dashboard";

  // 1. Direct role match
  const role = user.role;
  if (role && dashboardMapping[role]) return dashboardMapping[role];

  // 2. roleName field
  const roleName = user.roleName;
  if (roleName && dashboardMapping[roleName]) return dashboardMapping[roleName];

  // 3. role_id → resolved role name
  const roleFromId = user.role_id ? roleIdToName[user.role_id] : null;
  if (roleFromId && dashboardMapping[roleFromId])
    return dashboardMapping[roleFromId];
  if (roleFromId) {
    const inferred = inferFromSubstring(roleFromId);
    if (inferred) return inferred;
  }

  // 4. Unit fields — resolve UUID to display name first
  const unitRaw = user.unit_kerja ?? user.unit_id ?? user.unit ?? null;
  if (unitRaw) {
    const unitResolved = resolveUnit(unitRaw);
    if (dashboardMapping[unitResolved]) return dashboardMapping[unitResolved];
    const inferred = inferFromSubstring(unitResolved);
    if (inferred) return inferred;
  }

  // 5. jabatan
  if (user.jabatan) {
    const inferred = inferFromSubstring(user.jabatan);
    if (inferred) return inferred;
  }

  // 6. email / username
  const identity = user.email || user.username || "";
  if (identity) {
    const inferred = inferFromSubstring(identity);
    if (inferred) return inferred;
  }

  return "/dashboard";
}
