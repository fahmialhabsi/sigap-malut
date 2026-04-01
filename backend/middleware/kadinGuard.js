export default function kadinGuard(req, res, next) {
  const role = String(req.user?.role || req.user?.roleName || "").toLowerCase();
  const jabatan = String(req.user?.jabatan || "").toLowerCase();
  const username = String(req.user?.username || "").toLowerCase();
  const email = String(req.user?.email || "").toLowerCase();

  const ok =
    role === "kepala_dinas" ||
    role === "kadin" ||
    jabatan.includes("kepala dinas") ||
    username.includes("kepala_dinas") ||
    username.includes("kadin") ||
    email.includes("kadin");

  if (!ok) {
    return res.status(403).json({
      success: false,
      error: "forbidden",
      message: "Akses ditolak. Hanya Kepala Dinas.",
    });
  }
  return next();
}

