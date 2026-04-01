export default function bendaharaBarangGuard(req, res, next) {
  const role = String(req.user?.role || req.user?.roleName || "").toLowerCase();
  const jabatan = String(req.user?.jabatan || "").toLowerCase();
  const username = String(req.user?.username || "").toLowerCase();
  const email = String(req.user?.email || "").toLowerCase();

  const ok =
    role === "bendahara_barang" ||
    jabatan.includes("bendahara barang") ||
    jabatan.includes("pengurus") ||
    jabatan.includes("bmd") ||
    username.includes("bendahara_barang") ||
    email.includes("bendahara.barang");

  if (!ok) {
    return res.status(403).json({
      success: false,
      error: "forbidden",
      message: "Akses ditolak. Hanya Bendahara Barang / Pengurus BMD.",
    });
  }
  return next();
}

