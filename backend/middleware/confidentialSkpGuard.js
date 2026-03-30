// Guard: blokir Kepala Bidang dari mengakses nilai SKP Pelaksana (PP 30/2019)
// KRITIS: Kepala Bidang TIDAK boleh melihat nilai SKP Pelaksana yang dinilai oleh JF

const BLOCKED_ROLES = [
  'kepala_bidang_ketersediaan',
  'kepala_bidang_distribusi',
  'kepala_bidang_konsumsi',
  'kepala_bidang',
];

export function confidentialSkpGuard(req, res, next) {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'unauthenticated' });

  const role = (user.role || '').toLowerCase();
  if (BLOCKED_ROLES.some(r => role.includes(r.replace('kepala_bidang_', '').replace('kepala_bidang', 'kabid')))) {
    return res.status(403).json({
      error: 'forbidden',
      code: 'CONFIDENTIAL_SKP_PELAKSANA',
      message: 'Kepala Bidang tidak memiliki akses ke data penilaian kinerja Pelaksana. Diatur oleh PP 30/2019.'
    });
  }

  // Hanya JF penilai langsung yang bisa akses
  const targetPelaksanaId = req.params.pelaksanaId || req.params.id;
  if (targetPelaksanaId && user.id && !user.is_penilai_langsung) {
    // Backend perlu validasi: apakah user adalah JF yang menilai pelaksana ini?
    // Implementasi penuh via user_hierarchy check
    return next(); // lanjut ke controller untuk validasi hierarchy
  }

  return next();
}

export function blockSkpPelaksanaForKabid(req, res, next) {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'unauthenticated' });

  const role = (user.role || '').toLowerCase();
  const isKabid = role.includes('kepala_bidang') || role.includes('kabid');

  if (isKabid) {
    return res.status(403).json({
      error: 'forbidden',
      code: 'CONFIDENTIAL_SKP_PELAKSANA',
      message: 'Akses nilai kinerja Pelaksana diblokir untuk Kepala Bidang (PP 30/2019).'
    });
  }

  return next();
}
