// backend/middleware/kabidKetersediaanGuard.js
// Guard: hanya Kepala Bidang Ketersediaan (dan super_admin) yang bisa akses

const ALLOWED_ROLES = [
  "kepala_bidang_ketersediaan",
  "kepala_bidang",
  "super_admin",
];

export function kabidKetersediaanGuard(req, res, next) {
  const role = (
    req.user?.roleName ||
    req.user?.role ||
    ""
  ).toLowerCase();

  if (ALLOWED_ROLES.includes(role)) return next();

  return res.status(403).json({
    success: false,
    message: "Akses ditolak: hanya Kepala Bidang Ketersediaan yang diizinkan.",
  });
}

export default kabidKetersediaanGuard;
