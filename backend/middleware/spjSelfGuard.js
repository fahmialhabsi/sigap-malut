/**
 * spjSelfGuard.js
 *
 * Middleware guard untuk pembuatan SPJ.
 *
 * Sesuai dokumen 41 (Pedoman Mekanisme SPJ Mandiri dan Delegasi):
 *
 * Kondisi A — Mandiri:
 *   Siapapun bisa membuat SPJ untuk dirinya sendiri.
 *
 * Kondisi B — Delegasi:
 *   Hanya PPTK (jabatan mengandung "[PPTK]") yang boleh membuat SPJ
 *   atas nama pejabat lain. Pelaksana biasa tidak diizinkan.
 *
 * Guard ini TIDAK memblokir seluruh kondisi B lagi — melainkan
 * memvalidasi siapa yang boleh membuat SPJ delegasi.
 */
export default function spjSelfGuard(req, res, next) {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, error: "unauthenticated" });
  }

  const atasNamaPejabatId = req.body?.atas_nama_pejabat_id;
  const jenis = req.body?.jenis_kondisi || "mandiri";

  // ── Kondisi A: SPJ untuk diri sendiri ─────────────────────────────────────
  if (!atasNamaPejabatId || jenis === "mandiri") {
    req.body = {
      ...(req.body || {}),
      jenis_kondisi: "mandiri",
      dibuat_oleh: userId,
      atas_nama_pejabat_id: null,
      pptk_id: null,
    };
    return next();
  }

  // ── Kondisi B: SPJ atas nama pejabat lain ─────────────────────────────────
  // Hanya PPTK yang boleh (jabatan mengandung "[PPTK]" atau role khusus)
  const jabatan = String(req.user?.jabatan || "").toUpperCase();
  const roleName = String(req.user?.roleName || req.user?.role || "").toLowerCase();

  const isPptk =
    jabatan.includes("[PPTK]") ||
    jabatan.includes("PPTK") ||
    roleName.includes("pptk") ||
    roleName.includes("pelaksana_teknis");

  // Super admin dan sekretaris juga diizinkan untuk keperluan koreksi
  const isSuperAdmin = roleName.includes("super_admin") || roleName.includes("admin");
  const isSekretaris = roleName.includes("sekretaris");

  if (!isPptk && !isSuperAdmin && !isSekretaris) {
    return res.status(403).json({
      success: false,
      error: "SPJ_DELEGASI_BUKAN_PPTK",
      message:
        "Hanya PPTK yang boleh membuat SPJ atas nama pejabat lain. " +
        "Hubungi Admin jika Anda telah ditunjuk sebagai PPTK.",
    });
  }

  // Jangan izinkan PPTK membuat atas nama dirinya sendiri sebagai delegasi
  if (Number(atasNamaPejabatId) === Number(userId)) {
    return res.status(400).json({
      success: false,
      error: "SPJ_DELEGASI_SAMA",
      message: "Untuk SPJ atas nama diri sendiri, gunakan Kondisi Mandiri.",
    });
  }

  req.body = {
    ...(req.body || {}),
    jenis_kondisi: "delegasi",
    dibuat_oleh: userId,
    pptk_id: userId,
    atas_nama_pejabat_id: Number(atasNamaPejabatId),
    // Status awal kondisi B — belum bisa diproses ke Bendahara sebelum pejabat konfirmasi
    status: "draft_delegasi",
  };

  return next();
}
