/**
 * Selaras dengan backend `horizontalCoordinationStateMachine.js` & OpenAPI.
 */

export const HCOORD_WORKFLOW_STATUSES = [
  "diajukan",
  "diterima",
  "diproses",
  "menunggu_balasan",
  "terlambat",
];

export const HCOORD_TERMINAL_STATUSES = [
  "selesai",
  "dibatalkan",
  "ditolak",
  "gagal_koordinasi",
];

export const HCOORD_STATUS_LABELS = {
  diajukan: "Diajukan",
  diterima: "Diterima",
  diproses: "Diproses",
  menunggu_balasan: "Menunggu balasan",
  terlambat: "Terlambat (eskalasi)",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
  ditolak: "Ditolak",
  gagal_koordinasi: "Gagal koordinasi",
};

export function labelHCoordStatus(status) {
  const k = String(status || "").toLowerCase().trim();
  return HCOORD_STATUS_LABELS[k] || status || "—";
}
