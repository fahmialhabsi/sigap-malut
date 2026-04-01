export default function jfKeuanganGuard(req, res, next) {
  const role = String(req.user?.role || req.user?.roleName || "").toLowerCase();
  const unit = String(req.user?.unit_kerja || req.user?.unit_id || "").toLowerCase();

  const okRole =
    role.includes("fungsional") ||
    role.includes("jabatan_fungsional") ||
    role.includes("pejabat_fungsional") ||
    role.includes("jf");

  const okScope =
    role.includes("keuangan") ||
    role.includes("ppk") ||
    unit.includes("sekretariat");

  if (!okRole || !okScope) {
    return res.status(403).json({
      success: false,
      error: "forbidden",
      message: "Akses ditolak. Hanya JF Keuangan/PPK (Sekretariat).",
    });
  }
  return next();
}

