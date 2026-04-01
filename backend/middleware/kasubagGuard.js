export default function kasubagGuard(req, res, next) {
  const role = String(req.user?.role || req.user?.roleName || "").toLowerCase();
  // Banyak variasi penamaan di data seed/lama, jadi dibuat toleran.
  const ok =
    role === "kasubag_umum_kepegawaian" ||
    role === "kasubag" ||
    role === "kasubbag" ||
    role === "kasubbag_umum" ||
    role === "kasubbag_kepegawaian" ||
    role === "super_admin";

  if (!ok) {
    return res.status(403).json({
      success: false,
      error: "forbidden",
      message: "Akses ditolak. Hanya Kasubag Umum & Kepegawaian.",
    });
  }
  return next();
}

