export default function gubernurGuard(req, res, next) {
  const role = String(req.user?.role || req.user?.roleName || "").toLowerCase();
  const jabatan = String(req.user?.jabatan || "").toLowerCase();
  const username = String(req.user?.username || "").toLowerCase();
  const email = String(req.user?.email || "").toLowerCase();

  const ok =
    role === "gubernur" ||
    jabatan.includes("gubernur") ||
    username.includes("gubernur") ||
    email.includes("gubernur");

  if (!ok) {
    return res.status(403).json({
      success: false,
      error: "forbidden",
      message: "Akses ditolak. Hanya Gubernur.",
    });
  }
  return next();
}

