export default function bendaharaPengeluaranGuard(req, res, next) {
  const role = String(req.user?.role || req.user?.roleName || "").toLowerCase();
  const jabatan = String(req.user?.jabatan || "").toLowerCase();
  const username = String(req.user?.username || "").toLowerCase();
  const email = String(req.user?.email || "").toLowerCase();

  const ok =
    role === "bendahara_pengeluaran" ||
    jabatan.includes("bendahara pengeluaran") ||
    username.includes("bendahara_pengeluaran") ||
    email.includes("bendahara.pengeluaran");

  if (!ok) {
    return res.status(403).json({
      success: false,
      error: "forbidden",
      message: "Akses ditolak. Hanya Bendahara Pengeluaran.",
    });
  }
  return next();
}

