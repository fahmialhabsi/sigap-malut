import { unitNameToId } from "./unitMap";
import { roleIdToName } from "./roleMap";

// Build inverse mapping: unit UUID -> unit name
const idToUnitName = Object.entries(unitNameToId).reduce(
  (acc, [name, id]) => {
    acc[id] = name;
    return acc;
  },
  {},
);

// Mapping from role name to dashboard path
const roleDashboardMapping = {
  super_admin: "/dashboard/superadmin",
  kepala_dinas: "/dashboard/superadmin",
  sekretaris: "/dashboard/sekretariat",
  kepala_bidang_ketersediaan: "/dashboard/ketersediaan",
  kepala_bidang_distribusi: "/dashboard/distribusi",
  kepala_bidang_konsumsi: "/dashboard/konsumsi",
  kepala_uptd: "/dashboard/uptd",
};

// Mapping from unit name substring (lowercase) to dashboard path
const unitSubstringMapping = [
  ["distribusi", "/dashboard/distribusi"],
  ["ketersediaan", "/dashboard/ketersediaan"],
  ["konsumsi", "/dashboard/konsumsi"],
  ["sekretariat", "/dashboard/sekretariat"],
  ["uptd", "/dashboard/uptd"],
];

/**
 * Determines the correct dashboard path for a given user object.
 *
 * The user object may contain role/unit as UUIDs (from login response) or
 * as human-readable names (from /api/auth/me). Both cases are handled.
 *
 * @param {Object} user - The user object from authStore or localStorage
 * @returns {string} The dashboard path to redirect to
 */
export function getDashboardPath(user) {
  if (!user) return "/dashboard";

  // Resolve role name: prefer direct role string, fall back to role_id lookup
  const roleName = user.role || roleIdToName[user.role_id] || "";
  if (roleName && roleDashboardMapping[roleName]) {
    return roleDashboardMapping[roleName];
  }

  // Resolve unit: prefer unit_kerja, fall back to unit_id or unit
  const unitRaw = user.unit_kerja || user.unit_id || user.unit || "";
  // If unitRaw is a UUID, resolve it to a human-readable name; otherwise use as-is
  const unitResolved = idToUnitName[unitRaw] || unitRaw;
  const unitLower = unitResolved.toLowerCase();

  for (const [substring, path] of unitSubstringMapping) {
    if (unitLower.includes(substring)) {
      return path;
    }
  }

  return "/dashboard";
}
