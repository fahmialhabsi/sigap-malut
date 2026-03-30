// Guard khusus untuk endpoint Kepala Bidang Distribusi
import { blockSkpPelaksanaForKabid } from './confidentialSkpGuard.js';

const ALLOWED = [
  'kepala_bidang_distribusi',
  'kepala_bidang',
  'kabid_distribusi',
  'super_admin',
  'kepala_dinas',
];

export function requireKabidDistribusi(req, res, next) {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'unauthenticated' });

  const role = (user.role || '').toLowerCase();
  const unitKerja = (user.unit_kerja || '').toLowerCase();

  const isAllowed =
    ALLOWED.some(r => role.includes(r)) ||
    (unitKerja.includes('distribusi') && (role.includes('kepala_bidang') || role.includes('kabid')));

  if (!isAllowed) {
    return res.status(403).json({
      error: 'forbidden',
      message: 'Akses hanya untuk Kepala Bidang Distribusi.'
    });
  }

  return next();
}

export { blockSkpPelaksanaForKabid };
