// Guard khusus untuk endpoint Kepala Bidang Konsumsi & Penganekaragaman Pangan
import { blockSkpPelaksanaForKabid } from './confidentialSkpGuard.js';

const ALLOWED = [
  'kepala_bidang_konsumsi',
  'kepala_bidang',
  'kabid_konsumsi',
  'super_admin',
  'kepala_dinas',
];

export function requireKabidKonsumsi(req, res, next) {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'unauthenticated' });

  const role = (user.role || '').toLowerCase();
  const unitKerja = (user.unit_kerja || '').toLowerCase();

  const isAllowed =
    ALLOWED.some(r => role.includes(r)) ||
    (unitKerja.includes('konsumsi') && (role.includes('kepala_bidang') || role.includes('kabid')));

  if (!isAllowed) {
    return res.status(403).json({
      error: 'forbidden',
      message: 'Akses hanya untuk Kepala Bidang Konsumsi & Penganekaragaman Pangan.'
    });
  }

  return next();
}

export { blockSkpPelaksanaForKabid };
