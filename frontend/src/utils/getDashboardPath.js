import { unitNameToId } from "./unitMap";

// Build inverse mapping: UUID -> display name
const idToUnitName = Object.fromEntries(
  Object.entries(unitNameToId).map(([name, id]) => [id, name]),
);

// Dashboard mapping at module scope to avoid recreation on each call
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
 * Returns the dashboard path for a given user object.
 *
 * Handles the case where user.unit_kerja is stored as a UUID by resolving
 * it to a human-readable unit name via idToUnitName before inference.
 *
 * @param {Object} user - The authenticated user object from localStorage/store.
 * @returns {string} Dashboard path, e.g. "/dashboard/distribusi".
 */
export function getDashboardPath(user) {
  if (!user) return "/dashboard";

  // Check role-based mapping first
  if (user.role && dashboardMapping[user.role]) {
    return dashboardMapping[user.role];
  }

  // Resolve unit_kerja: if it is a UUID, map it to the display name
  let unitName = user.unit_kerja || "";
  if (idToUnitName[unitName]) {
    unitName = idToUnitName[unitName];
  }

  // Check resolved unit name
  if (unitName && dashboardMapping[unitName]) {
    return dashboardMapping[unitName];
  }

  // Substring fallback for partial matches (e.g. "Bidang Distribusi dan Cadangan Pangan")
  if (unitName) {
    const lower = unitName.toLowerCase();
    if (lower.includes("distribusi")) return "/dashboard/distribusi";
    if (lower.includes("ketersediaan")) return "/dashboard/ketersediaan";
    if (lower.includes("konsumsi")) return "/dashboard/konsumsi";
    if (lower.includes("sekretariat")) return "/dashboard/sekretariat";
    if (lower.includes("uptd")) return "/dashboard/uptd";
  }

  // Email-based fallback
  if (user.email) {
    const emailLower = user.email.toLowerCase();
    if (emailLower.includes("distribusi")) return "/dashboard/distribusi";
    if (emailLower.includes("ketersediaan")) return "/dashboard/ketersediaan";
    if (emailLower.includes("konsumsi")) return "/dashboard/konsumsi";
    if (emailLower.includes("sekretariat")) return "/dashboard/sekretariat";
    if (emailLower.includes("uptd")) return "/dashboard/uptd";
  }

  return "/dashboard";
}
