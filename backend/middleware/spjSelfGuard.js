export default function spjSelfGuard(req, res, next) {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, error: "unauthenticated" });
  }

  // Hard rule: Pelaksana hanya boleh buat SPJ untuk dirinya sendiri.
  // Jika client mengirim field lain, kita blokir.
  const penerima = req.body?.penerima_uang_id;
  if (penerima != null && Number(penerima) !== Number(userId)) {
    return res.status(403).json({
      success: false,
      error: "SPJ_ATAS_NAMA_ORANG_LAIN",
      message: "Anda hanya bisa membuat SPJ untuk diri sendiri.",
    });
  }

  // Force ownership
  req.body = {
    ...(req.body || {}),
    dibuat_oleh: userId,
    penerima_uang_id: userId,
  };
  return next();
}

