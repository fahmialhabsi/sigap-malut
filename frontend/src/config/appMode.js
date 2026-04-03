/**
 * Mode data untuk UI — produksi tidak boleh menampilkan KPI/alert statis sebagai "nyata".
 * Staging: set VITE_DEMO_DATA=1 untuk menampilkan data contoh dengan label.
 * Development: fallback demo aktif hanya jika VITE_DEMO_DATA tidak eksplisit '0'.
 */
export function isDemoDataAllowed() {
  const v = import.meta.env?.VITE_DEMO_DATA;
  if (v === "0" || v === "false") return false;
  if (v === "1" || v === "true") return true;
  return import.meta.env.DEV === true;
}

export function showSimulationBadge() {
  return isDemoDataAllowed();
}
