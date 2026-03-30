// Guard khusus untuk endpoint Kepala Bidang Ketersediaan
import { blockSkpPelaksanaForKabid } from './confidentialSkpGuard.js';

const ALLOWED_ROLES_KABID_KETERSEDIAAN = [
  'kepala_bidang_ketersediaan',
  'kepala_bidang',
  'super_admin',
  'kepala_dinas',
];

export function requireKabidKetersediaan(req, res, next) {
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'unauthenticated' });

  const role = (user.role || '').toLowerCase();
  const unitKerja = (user.unit_kerja || '').toLowerCase();

  const isAllowed =
    ALLOWED_ROLES_KABID_KETERSEDIAAN.some(r => role.includes(r)) ||
    (unitKerja.includes('ketersediaan') && (role.includes('kepala_bidang') || role.includes('kabid')));

  if (!isAllowed) {
    return res.status(403).json({
      error: 'forbidden',
      message: 'Akses hanya untuk Kepala Bidang Ketersediaan.'
    });
  }

  return next();
}

export { blockSkpPelaksanaForKabid };
