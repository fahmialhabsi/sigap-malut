/**
 * SpjStatusBadge — label status SPJ sesuai alur dokumen 41
 */
const STATUS_CFG = {
  // Kondisi A
  draft:                      { label: "Draft",                   color: "bg-gray-100 text-gray-600 border-gray-200" },
  diajukan_ke_bendahara:      { label: "Menunggu Bendahara",      color: "bg-amber-100 text-amber-700 border-amber-200" },
  terverifikasi_bendahara:    { label: "Terverifikasi Bendahara", color: "bg-blue-100 text-blue-700 border-blue-200" },
  diajukan_ke_ppk:            { label: "Menunggu PPK-SKPD",       color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  terverifikasi_ppk:          { label: "Terverifikasi PPK",       color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  selesai_ppk:                { label: "SPM Diterbitkan ✓",       color: "bg-emerald-200 text-emerald-800 border-emerald-300" },
  // Kondisi B
  draft_delegasi:             { label: "Draft (Delegasi)",        color: "bg-gray-100 text-gray-600 border-gray-200" },
  menunggu_konfirmasi_pejabat:{ label: "Menunggu Konfirmasi Pejabat", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  dikonfirmasi_pejabat:       { label: "Dikonfirmasi Pejabat ✓",  color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  ditolak_pejabat:            { label: "Ditolak Pejabat",         color: "bg-red-100 text-red-700 border-red-200" },
  // Return paths
  dikembalikan_bendahara:     { label: "Dikembalikan Bendahara",  color: "bg-orange-100 text-orange-700 border-orange-200" },
  dikembalikan_ppk:           { label: "Dikembalikan PPK",        color: "bg-orange-100 text-orange-700 border-orange-200" },
  ditolak_ppk:                { label: "Ditolak PPK",             color: "bg-red-200 text-red-800 border-red-300" },
  dibayarkan:                 { label: "Dibayarkan",              color: "bg-green-100 text-green-700 border-green-200" },
};

export default function SpjStatusBadge({ status, size = "sm" }) {
  const cfg = STATUS_CFG[status] || { label: status || "—", color: "bg-gray-100 text-gray-500 border-gray-200" };
  const sizeClass = size === "xs" ? "text-[10px] px-1.5 py-0.5" : "text-xs px-2.5 py-1";
  return (
    <span className={`inline-block rounded-full border font-semibold ${sizeClass} ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}
