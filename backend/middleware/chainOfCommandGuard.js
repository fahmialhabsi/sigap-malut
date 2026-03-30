// Guard: memastikan alur dokumen mengikuti rantai komando
// Pelaksana -> JF -> Kepala Bidang -> Sekretaris -> Kepala Dinas
// Tidak boleh bypass (skip level)

const CHAIN_BIDANG = ['pelaksana', 'jabatan_fungsional', 'kepala_bidang', 'sekretaris', 'kepala_dinas'];

export function requireJFBeforeKabid(req, res, next) {
  // Endpoint ini memastikan dokumen sudah melewati JF sebelum ke Kabid
  const { jf_diverifikasi, jf_id } = req.body || {};

  if (!jf_diverifikasi || !jf_id) {
    return res.status(422).json({
      error: 'chain_of_command_violation',
      code: 'BYPASS_JF',
      message: 'Dokumen harus melalui Jabatan Fungsional (JF) terlebih dahulu sebelum diteruskan ke Kepala Bidang.'
    });
  }

  return next();
}

export function blockDirectSubmitToKabid(req, res, next) {
  // Blokir Pelaksana submit langsung ke Kepala Bidang (harus lewat JF)
  const user = req.user;
  if (!user) return res.status(401).json({ error: 'unauthenticated' });

  const role = (user.role || '').toLowerCase();
  const isPelaksana = role.includes('pelaksana') || role.includes('staf');

  if (isPelaksana) {
    // Pelaksana hanya boleh submit ke JF, bukan langsung ke Kabid
    const targetEndpoint = req.originalUrl || '';
    if (targetEndpoint.includes('kabid') || targetEndpoint.includes('kepala-bidang')) {
      return res.status(403).json({
        error: 'forbidden',
        code: 'CHAIN_OF_COMMAND_VIOLATION',
        message: 'Pelaksana tidak dapat langsung mengajukan dokumen ke Kepala Bidang. Ajukan ke Jabatan Fungsional terlebih dahulu.'
      });
    }
  }

  return next();
}

export function requireSekretarisBeforeKadin(req, res, next) {
  // Memastikan dokumen formal sudah melewati Sekretaris sebelum ke Kepala Dinas
  const { sekretaris_disetujui, sekretaris_id } = req.body || {};

  if (!sekretaris_disetujui || !sekretaris_id) {
    return res.status(422).json({
      error: 'chain_of_command_violation',
      code: 'BYPASS_SEKRETARIS',
      message: 'Dokumen formal harus melewati Sekretaris sebelum diteruskan ke Kepala Dinas.'
    });
  }

  return next();
}
