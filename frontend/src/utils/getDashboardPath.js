// frontend/src/utils/getDashboardPath.js
// helper untuk menurunkan target dashboard dari objek user
import { roleIdToName } from "./roleMap";
import { unitNameToId, unitIdToName } from "./unitMap"; // gunakan kedua mapping

export function getDashboardPath(user) {
  if (!user) return "/dashboard";

  // mapping role langsung ke path (jika backend memberikan role spesifik)
  const dashboardMapping = {
    super_admin: "/dashboard/superadmin",
    kepala_dinas: "/dashboard/kepala-dinas",
    gubernur: "/dashboard/gubernur",
    sekretaris: "/dashboard/sekretariat",
    "bidang ketersediaan": "/dashboard/ketersediaan",
    "bidang distribusi": "/dashboard/distribusi",
    "bidang konsumsi": "/dashboard/konsumsi",
    // kepala_bidang (generic) tidak di-map — biarkan unit_kerja fallback menentukan
    kepala_bidang_ketersediaan: "/dashboard/ketersediaan",
    kepala_bidang_distribusi: "/dashboard/distribusi",
    kepala_bidang_konsumsi: "/dashboard/konsumsi",
    kepala_uptd: "/dashboard/uptd",
    uptd: "/dashboard/uptd",
    kasubag_umum_kepegawaian: "/dashboard/kasubag",
    kasubag: "/dashboard/kasubag",
    pejabat_fungsional: "/dashboard/fungsional",
    fungsional: "/dashboard/fungsional",
    fungsional_ketersediaan: "/dashboard/fungsional-ketersediaan",
    fungsional_distribusi: "/dashboard/fungsional-distribusi",
    fungsional_konsumsi: "/dashboard/fungsional-konsumsi",
    fungsional_perencana: "/dashboard/fungsional-perencanaan",
    fungsional_keuangan: "/dashboard/fungsional-keuangan",
    fungsional_analis: "/dashboard/fungsional-keuangan",
    fungsional_uptd: "/dashboard/fungsional-uptd",
    fungsional_uptd_mutu: "/dashboard/fungsional-uptd-mutu",
    fungsional_uptd_teknis: "/dashboard/fungsional-uptd-teknis",
    bendahara: "/dashboard/bendahara",
    bendahara_pengeluaran: "/dashboard/bendahara-pengeluaran",
    bendahara_gaji: "/dashboard/bendahara-gaji",
    bendahara_barang: "/dashboard/bendahara-barang",
    pelaksana: "/dashboard/pelaksana", // fallback; unit_kerja inference below overrides this
    pelaksana_sekretariat: "/dashboard/pelaksana-sekretariat",
    pelaksana_ketersediaan: "/dashboard/pelaksana-ketersediaan",
    pelaksana_distribusi: "/dashboard/pelaksana-distribusi",
    pelaksana_konsumsi: "/dashboard/pelaksana-konsumsi",
    pelaksana_uptd: "/dashboard/pelaksana-uptd",
    kasubag_uptd: "/dashboard/kasubag-uptd",
    kasubbag_tu_uptd: "/dashboard/kasubag-uptd",
    kasubbag_umum_kepegawaian: "/dashboard/kasubag",
    kepala_seksi_uptd: "/dashboard/kasi-uptd",
    kasi_uptd: "/dashboard/kasi-uptd",
    kasi_mutu_uptd: "/dashboard/kasi-mutu",
    kasi_teknis_uptd: "/dashboard/kasi-teknis",
    seksi_manajemen_mutu: "/dashboard/kasi-mutu",
    seksi_manajemen_teknis: "/dashboard/kasi-teknis",
    jabatan_fungsional: "/dashboard/fungsional",
    fungsional_analis: "/dashboard/fungsional",
  };

  // 0) jika backend sudah memberi dashboardUrl
  if (user.dashboardUrl) return user.dashboardUrl;

  // 1) role (string) langsung, normalize
  if (user.role) {
    const roleKey = String(user.role).toLowerCase();
    if (dashboardMapping[roleKey]) return dashboardMapping[roleKey];
  }

  // 1b) jika ada roleName field gunakan itu
  if (user.roleName) {
    const roleNameKey = String(user.roleName).toLowerCase();
    if (dashboardMapping[roleNameKey]) return dashboardMapping[roleNameKey];
  }

  // 2) cek role_id -> map via roleIdToName jika ada
  if (user.role_id) {
    const mapped =
      roleIdToName?.[String(user.role_id)] ||
      roleIdToName?.[String(user.role_id).toLowerCase()];
    if (mapped) {
      const mappedKey = String(mapped).toLowerCase();
      if (dashboardMapping[mappedKey]) return dashboardMapping[mappedKey];
      // kalau mapped === 'kepala_bidang', lanjutkan ke inferensi unit di bawah
    }
    // Fallback: jika email superadmin@dinpangan.go.id atau username superadmin, arahkan ke dashboard superadmin
    if (
      (user.email &&
        user.email.toLowerCase() === "superadmin@dinpangan.go.id") ||
      (user.username && user.username.toLowerCase() === "superadmin")
    ) {
      return "/dashboard/superadmin";
    }
  }

  // Build inverse map id -> display name (lowercased keys) (fallback jika unitIdToName tidak diekspor)
  const idToUnitName =
    (unitIdToName && typeof unitIdToName === "object" && unitIdToName) ||
    Object.fromEntries(
      Object.entries(unitNameToId || {}).map(([displayName, id]) => [
        String(id).toLowerCase(),
        displayName,
      ]),
    );

  // 3) periksa beberapa field yang mungkin berisi nama bidang (toleran terhadap space/case)
  // Pertama ambil nilai raw unit dari beberapa kemungkinan field
  const rawUnit =
    user.unit_kerja ||
    user.unit ||
    user.unit_id ||
    user.unitName ||
    user.unit_name ||
    user.unit_kerja_name ||
    "";

  // Jika rawUnit adalah id yang ada di mapping, resolve ke display name
  const rawUnitStr = String(rawUnit || "");
  const resolvedFromId = idToUnitName[rawUnitStr.toLowerCase()];
  const unitVal = (resolvedFromId || rawUnitStr).toString().toLowerCase();

  // Pelaksana: route to per-bidang dashboard based on unit_kerja
  const isPelaksana = ["pelaksana", "staf"].includes(
    (user.role || user.roleName || "").toString().toLowerCase()
  );
  if (isPelaksana) {
    if (unitVal.includes("ketersediaan")) return "/dashboard/pelaksana-ketersediaan";
    if (unitVal.includes("distribusi")) return "/dashboard/pelaksana-distribusi";
    if (unitVal.includes("konsumsi")) return "/dashboard/pelaksana-konsumsi";
    if (unitVal.includes("uptd")) return "/dashboard/pelaksana-uptd";
    if (unitVal.includes("sekretariat") || unitVal.includes("sekretaris")) return "/dashboard/pelaksana-sekretariat";
  }

  if (unitVal.includes("ketersediaan")) return "/dashboard/ketersediaan";
  if (unitVal.includes("distribusi")) return "/dashboard/distribusi";
  if (unitVal.includes("konsumsi")) return "/dashboard/konsumsi";
  if (unitVal.includes("perencanaan")) return "/dashboard/fungsional-perencanaan";
  if (unitVal.includes("keuangan")) return "/dashboard/fungsional-keuangan";
  if (unitVal.includes("analis")) return "/dashboard/fungsional-keuangan";

  // 4) cek jabatan (contoh: "Kepala Bidang Ketersediaan")
  const jabatan = (user.jabatan || user.position || user.role_title || "")
    .toString()
    .toLowerCase();
  if (jabatan.includes("ketersediaan")) return "/dashboard/ketersediaan";
  if (jabatan.includes("distribusi")) return "/dashboard/distribusi";
  if (jabatan.includes("konsumsi")) return "/dashboard/konsumsi";
  if (jabatan.includes("perencana") || jabatan.includes("perencanaan"))
    return "/dashboard/fungsional-perencanaan";
  if (jabatan.includes("keuangan")) return "/dashboard/fungsional-keuangan";
  if (jabatan.includes("analis")) return "/dashboard/fungsional-keuangan";

  // 5) fallback: cek email / username
  const email = (user.email || "").toString().toLowerCase();
  const username = (user.username || "").toString().toLowerCase();
  if (email.includes("ketersediaan") || username.includes("ketersediaan"))
    return "/dashboard/ketersediaan";
  if (email.includes("distribusi") || username.includes("distribusi"))
    return "/dashboard/distribusi";
  if (email.includes("konsumsi") || username.includes("konsumsi"))
    return "/dashboard/konsumsi";
  if (email.includes("perencana") || email.includes("perencanaan") || username.includes("perencana"))
    return "/dashboard/fungsional-perencanaan";
  if (email.includes("keuangan") || username.includes("keuangan"))
    return "/dashboard/fungsional-keuangan";
  if (email.includes("analis") || username.includes("analis"))
    return "/dashboard/fungsional-keuangan";

  // default fallback
  return "/dashboard";
}
