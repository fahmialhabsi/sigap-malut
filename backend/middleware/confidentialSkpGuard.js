// backend/middleware/confidentialSkpGuard.js
// KRITIS (PP 30/2019): blokir Kepala Bidang dari mengakses nilai SKP Pelaksana
// Hanya JF penilai langsung yang boleh akses nilai kinerja Pelaksana di bawahnya

const BLOCKED_ROLES = [
  "kepala_bidang_ketersediaan",
  "kepala_bidang_distribusi",
  "kepala_bidang_konsumsi",
  "kepala_bidang",
  "kepala_dinas",
  "sekretaris",
  "gubernur",
];

export function confidentialSkpGuard(req, res, next) {
  const role = (
    req.user?.roleName ||
    req.user?.role ||
    ""
  ).toLowerCase();

  if (BLOCKED_ROLES.includes(role)) {
    return res.status(403).json({
      success: false,
      message:
        "AKSES DIBLOKIR: Nilai kinerja Pelaksana bersifat CONFIDENTIAL dan hanya " +
        "dapat diakses oleh JF penilai langsung. (PP 30/2019)",
      code: "CONFIDENTIAL_SKP_BLOCKED",
    });
  }

  next();
}

// Guard tambahan: verifikasi bahwa JF yang mengakses adalah penilai langsung
// (bukan JF lain di bidang yang sama)
export function selfJfSkpGuard(req, res, next) {
  const role = (req.user?.roleName || req.user?.role || "").toLowerCase();
  const isJf =
    role.includes("fungsional") ||
    role.includes("jf_") ||
    role.includes("analis") ||
    role === "super_admin";

  if (!isJf) {
    return res.status(403).json({
      success: false,
      message: "Akses ditolak: hanya Pejabat Fungsional yang dapat menilai Pelaksana.",
    });
  }

  next();
}

export default confidentialSkpGuard;
