const EXCLUDED_FROM_INTERNAL_PILOT = new Set([
  "super_admin",
  "kepala_dinas",
  "gubernur",
  "masyarakat",
  "publik",
  "public",
  "guest",
]);

const normalizeSimple = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

export const UPTD_PILOT_STANDARD_VERSION = "1.0.0";

export const UPTD_PILOT_ALLOWED_ROLES = Object.freeze([
  "kepala_uptd",
  "kasi_uptd",
  "kasubbag_tu_uptd",
  "kasi_mutu_uptd",
  "kasi_teknis_uptd",
]);

export const UPTD_PILOT_LEADER_ROLES = Object.freeze(["kepala_uptd"]);

export const UPTD_PILOT_SCOPE_UNITS = Object.freeze([
  "UPTD",
  "UPTD Balai Pengawasan Mutu",
  "UPTD Balai Pengawasan Mutu & Keamanan Pangan",
]);

export const UPTD_PILOT_REPLICATION_UNITS = Object.freeze([
  "Sekretariat",
  "Bidang Ketersediaan",
  "Bidang Distribusi",
  "Bidang Konsumsi",
]);

export const UPTD_PILOT_REVIEWER_ROLES = Object.freeze([
  "sekretaris",
  "kepala_bidang",
  "kasubbag",
  "kasubbag_umum",
  "kasubbag_kepegawaian",
  "kasubbag_perencanaan",
  "fungsional",
  "fungsional_perencana",
  "fungsional_analis",
]);

export const normalizeRole = (role) =>
  String(role || "")
    .trim()
    .toLowerCase();

export const normalizeUnitKerja = (unit) => {
  const normalized = String(unit || "").trim();

  // Seluruh pilot ini dipusatkan ke domain UPTD agar replikasi lintas-bidang konsisten.
  if (!normalized) {
    return "UPTD";
  }

  return /uptd/i.test(normalized) ? "UPTD" : normalized;
};

export const isRoleExcludedFromInternalPilot = (role) =>
  EXCLUDED_FROM_INTERNAL_PILOT.has(normalizeRole(role));

export const isUptdPilotRole = (role) =>
  UPTD_PILOT_ALLOWED_ROLES.includes(normalizeRole(role));

export const isUptdPilotLeader = (role) =>
  UPTD_PILOT_LEADER_ROLES.includes(normalizeRole(role));

export const isUptdScopedUnit = (unit) => /uptd/i.test(String(unit || ""));

export const isUptdPilotReviewerRole = (role) =>
  UPTD_PILOT_REVIEWER_ROLES.includes(normalizeRole(role));

export const isPilotReplicationUnit = (unit) => {
  const normalizedUnit = normalizeSimple(unit);
  return UPTD_PILOT_REPLICATION_UNITS.some(
    (allowedUnit) => normalizeSimple(allowedUnit) === normalizedUnit,
  );
};
