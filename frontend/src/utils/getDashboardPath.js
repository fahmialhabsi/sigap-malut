// frontend/src/utils/getDashboardPath.js
// helper untuk menurunkan target dashboard dari objek user
import { roleIdToName } from "./roleMap";
import { unitNameToId, unitIdToName } from "./unitMap"; // gunakan kedua mapping

function normRoleKey(v) {
  if (v == null || v === "") return "";
  return String(v)
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

export function getDashboardPath(user) {
  if (!user) return "/dashboard";

  // mapping role langsung ke path (jika backend memberikan role spesifik)
  const dashboardMapping = {
    super_admin: "/dashboard/superadmin",
    kepala_dinas: "/dashboard/kepala-dinas",
    sekretaris: "/dashboard/sekretaris",
    "bidang ketersediaan": "/dashboard/ketersediaan",
    "bidang distribusi": "/dashboard/distribusi",
    "bidang konsumsi": "/dashboard/konsumsi",
    kepala_bidang_ketersediaan: "/dashboard/ketersediaan",
    kepala_bidang_distribusi: "/dashboard/distribusi",
    kepala_bidang_konsumsi: "/dashboard/konsumsi",
    kasubag_tu_uptd: "/dashboard/kasubag-uptd",
    kasi_mutu: "/dashboard/kasi-uptd",
    kasi_teknis: "/dashboard/kasi-uptd",
    pelaksana_sekretariat: "/dashboard/kasubag",
    // Kasubag Umum & Kepegawaian
    kasubag_umum_kepegawaian: "/dashboard/kasubag",
    kasubag: "/dashboard/kasubag",
    kasubbag: "/dashboard/kasubag",
    kasubbag_umum: "/dashboard/kasubag",
    kasubbag_kepegawaian: "/dashboard/kasubag",
    // UPTD
    uptd: "/dashboard/uptd",
    kepala_uptd: "/dashboard/uptd",
    subbag_tata_usaha: "/dashboard/kasubag-uptd",
    kasubag_uptd: "/dashboard/kasubag-uptd",
    kasubbag_tata_usaha: "/dashboard/kasubag-uptd",
    seksi_manajemen_mutu: "/dashboard/kasi-uptd",
    seksi_manajemen_teknis: "/dashboard/kasi-uptd",
    kasi_uptd: "/dashboard/kasi-uptd",
    kasi_mutu: "/dashboard/kasi-uptd",
    kasi_teknis: "/dashboard/kasi-uptd",
    kasi_mutu_uptd: "/dashboard/kasi-uptd",
    kasi_teknis_uptd: "/dashboard/kasi-uptd",
    kasubbag_tu_uptd: "/dashboard/kasubag-uptd",

    // Bendahara (sub-role)
    bendahara_pengeluaran: "/dashboard/bendahara",
    bendahara_gaji: "/dashboard/bendahara",
    bendahara_barang: "/dashboard/bendahara",

    // Jabatan fungsional (sekretariat & bidang)
    jabatan_fungsional: "/dashboard/fungsional",
    pejabat_fungsional: "/dashboard/fungsional",
    fungsional: "/dashboard/fungsional",
    fungsional_perencana: "/dashboard/fungsional",
    fungsional_perencanaan: "/dashboard/fungsional",
    fungsional_keuangan: "/dashboard/fungsional",
    fungsional_analis: "/dashboard/fungsional",
    fungsional_ketersediaan: "/dashboard/fungsional",
    fungsional_distribusi: "/dashboard/fungsional",
    fungsional_konsumsi: "/dashboard/fungsional",
    fungsional_uptd_mutu: "/dashboard/fungsional",
    fungsional_uptd_teknis: "/dashboard/fungsional",
    pelaksana_ketersediaan: "/dashboard/pelaksana",
    pelaksana_distribusi: "/dashboard/pelaksana",
    pelaksana_konsumsi: "/dashboard/pelaksana",
  };

  // 0) jika backend sudah memberi dashboardUrl
  if (user.dashboardUrl) return user.dashboardUrl;

  // 1) role / roleName — normalisasi underscore (selaras authStore)
  const rk = normRoleKey(user.role);
  const rnk = normRoleKey(user.roleName);
  if (rk && dashboardMapping[rk]) return dashboardMapping[rk];
  if (rnk && dashboardMapping[rnk]) return dashboardMapping[rnk];

  // 2) cek role_id -> map via roleIdToName jika ada
  if (user.role_id) {
    const mapped =
      roleIdToName?.[String(user.role_id)] ||
      roleIdToName?.[String(user.role_id).toLowerCase()];
    if (mapped) {
      const mappedKey = normRoleKey(mapped);
      if (dashboardMapping[mappedKey]) return dashboardMapping[mappedKey];
      // kalau mapped === 'kepala_bidang', lanjutkan ke inferensi unit di bawah
    }
  }

  // 2b) JF bidang / UPTD / pelaksana bidang — hindari salah ke dashboard Kabid dari unit
  if (rk.startsWith("fungsional_uptd_")) return "/dashboard/fungsional";
  if (rk.startsWith("fungsional_")) return "/dashboard/fungsional";
  if (rk === "pelaksana_sekretariat") return "/dashboard/kasubag";
  if (rk.startsWith("pelaksana_")) return "/dashboard/pelaksana";

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

  if (unitVal.includes("ketersediaan")) return "/dashboard/ketersediaan";
  if (unitVal.includes("distribusi")) return "/dashboard/distribusi";
  if (unitVal.includes("konsumsi")) return "/dashboard/konsumsi";
  if (unitVal.includes("uptd")) {
    const r = (user.role || user.roleName || "").toString().toLowerCase();
    if (r.includes("kasi") || r.includes("seksi")) return "/dashboard/kasi-uptd";
    if (r.includes("kasubag") || r.includes("tata_usaha") || r.includes("tu"))
      return "/dashboard/kasubag-uptd";
    if (r.includes("fungsional")) return "/dashboard/fungsional";
    if (r.includes("pelaksana")) return "/dashboard/pelaksana";
    return "/dashboard/uptd";
  }

  // 4) cek jabatan (contoh: "Kepala Bidang Ketersediaan")
  const jabatan = (user.jabatan || user.position || user.role_title || "")
    .toString()
    .toLowerCase();
  if (jabatan.includes("ketersediaan")) return "/dashboard/ketersediaan";
  if (jabatan.includes("distribusi")) return "/dashboard/distribusi";
  if (jabatan.includes("konsumsi")) return "/dashboard/konsumsi";

  // 5) fallback: cek email / username
  const email = (user.email || "").toString().toLowerCase();
  const username = (user.username || "").toString().toLowerCase();
  if (email.includes("ketersediaan") || username.includes("ketersediaan"))
    return "/dashboard/ketersediaan";
  if (email.includes("distribusi") || username.includes("distribusi"))
    return "/dashboard/distribusi";
  if (email.includes("konsumsi") || username.includes("konsumsi"))
    return "/dashboard/konsumsi";

  // default fallback
  return "/dashboard";
}
