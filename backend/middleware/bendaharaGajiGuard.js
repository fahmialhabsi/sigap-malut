export default function bendaharaGajiGuard(req, res, next) {
  const role = String(req.user?.role || req.user?.roleName || "").toLowerCase();
  const jabatan = String(req.user?.jabatan || "").toLowerCase();
  const username = String(req.user?.username || "").toLowerCase();
  const email = String(req.user?.email || "").toLowerCase();

  const ok =
    role === "bendahara_gaji" ||
    jabatan.includes("bendahara gaji") ||
    username.includes("bendahara_gaji") ||
    email.includes("bendahara.gaji");

  if (!ok) {
    return res.status(403).json({
      success: false,
      error: "forbidden",
      message: "Akses ditolak. Hanya Bendahara Gaji.",
    });
  }
  return next();
}

