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
    sekretaris: "/dashboard/sekretariat",
    "bidang ketersediaan": "/dashboard/ketersediaan",
    "bidang distribusi": "/dashboard/distribusi",
    "bidang konsumsi": "/dashboard/konsumsi",
    kepala_bidang_ketersediaan: "/dashboard/ketersediaan",
    kepala_bidang_distribusi: "/dashboard/distribusi",
    kepala_bidang_konsumsi: "/dashboard/konsumsi",
    uptd: "/dashboard/uptd",
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

  if (unitVal.includes("ketersediaan")) return "/dashboard/ketersediaan";
  if (unitVal.includes("distribusi")) return "/dashboard/distribusi";
  if (unitVal.includes("konsumsi")) return "/dashboard/konsumsi";

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
