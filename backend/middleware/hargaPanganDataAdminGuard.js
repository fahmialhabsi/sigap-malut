/**
 * Koreksi data harga setelah terverifikasi: hanya peran administratif tertentu.
 * Selaras dengan hargaPanganService.adminAmendHargaPanganRow (bypass lock).
 */
export function requireHargaPanganDataAdmin(req, res, next) {
  const user = req.user;
  if (!user) return res.status(401).json({ error: "unauthenticated" });

  const r = (user.role || "").toLowerCase();
  if (r.includes("super_admin") || r.includes("kepala_dinas")) {
    return next();
  }

  return res.status(403).json({
    error: "forbidden",
    code: "HARGA_PANGAN_AMEND_ADMIN_ONLY",
    message: "Perubahan data terverifikasi hanya untuk super_admin / kepala_dinas.",
  });
}
