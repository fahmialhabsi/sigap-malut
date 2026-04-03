/** Tier organisasi untuk grouping timeline & KPI (bukan semua role). */
export function assigneeRoleToOrgLevel(role) {
  const r = String(role || "").toLowerCase().replace(/\s+/g, " ");
  if (r.includes("gubernur")) return "gubernur";
  if (r.includes("kepala dinas") || r.includes("kepala_dinas")) return "kadis";
  if (r.includes("sekretaris")) return "sekretaris";
  if (r.includes("kepala bidang") || r.startsWith("kepala_bidang")) return "kabid";
  if (r.includes("kepala uptd") || r.includes("uptd")) return "uptd";
  return "pelaksana";
}

export function unitKerjaToOrgLevel(unitKerja) {
  const s = String(unitKerja || "");
  if (s.includes("UPTD")) return "uptd";
  if (s.startsWith("Bidang")) return "kabid";
  if (s.includes("Sekretariat")) return "sekretaris";
  return "operasional";
}

export function inferOperationalMarker(status) {
  const s = String(status || "").toLowerCase();
  if (s === "final" || s === "approved" || s === "selesai") return "selesai";
  if (s === "draft" || s === "review") return "sedang_diproses";
  return "sedang_diproses";
}
