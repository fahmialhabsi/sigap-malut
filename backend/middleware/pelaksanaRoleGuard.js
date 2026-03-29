// backend/middleware/pelaksanaRoleGuard.js
// Guard untuk endpoint Pelaksana SEKRETARIAT — hanya role 'pelaksana'

import UserHierarchy from "../models/UserHierarchy.js";

export const pelaksanaRoleGuard = (req, res, next) => {
  const role = req.user?.role;
  if (role !== 'pelaksana') {
    return res.status(403).json({
      success: false,
      message: `Akses ditolak — hanya role 'pelaksana' yang diizinkan (current: ${role})`
    });
  }
  next();
};

// Guard KRITIS: SPJ hanya bisa dibuat untuk diri sendiri (BAGIAN I)
export const spjSelfGuard = (req, res, next) => {
  const uid = req.user.id;
  const { penerima_uang_id, atas_nama_id, pelaksana_id } = req.body;

  const claimedId = penerima_uang_id || atas_nama_id || pelaksana_id;
  if (claimedId && String(claimedId) !== String(uid)) {
    return res.status(403).json({
      success: false,
      error: 'SPJ_ATAS_NAMA_ORANG_LAIN',
      message: 'Anda hanya boleh membuat SPJ untuk diri sendiri. Penerima uang harus membuat SPJ-nya sendiri.'
    });
  }

  // Paksa field identitas diri sendiri
  req.body.pelaksana_id = uid;
  req.body.dibuat_oleh = uid;
  req.body.penerima_uang_id = uid;
  next();
};

// Guard: Submit tugas WAJIB ke atasan langsung via user_hierarchy
export const submitTugasGuard = async (req, res, next) => {
  try {
    const { submit_ke } = req.body; // opsional
    const uid = req.user.id;

    // Gunakan field yang ada di model UserHierarchy (user_id + supervisor_id)
    const hierarki = await UserHierarchy.findOne({
      where: { user_id: uid }
    });

    if (submit_ke && hierarki && String(submit_ke) !== String(hierarki.supervisor_id)) {
      return res.status(403).json({
        success: false,
        error: 'BYPASS_HIERARCHY',
        message: `Tugas harus disubmit ke atasan langsung (supervisor_id: ${hierarki.supervisor_id}). Tidak boleh bypass ke ${submit_ke}.`
      });
    }

    // Attach info atasan ke req untuk controller
    req.atasanLangsung = hierarki ? { atasan_id: hierarki.supervisor_id } : null;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Gagal validasi hierarchy: ' + error.message
    });
  }
};

// Privacy Guards: read-only hanya milik sendiri
export const skpPrivacyGuard = (req, res, next) => {
  req.query.dinilai_id = req.user.id;
  next();
};

export const slipGajiPrivacyGuard = (req, res, next) => {
  req.query.asn_id = req.user.id;
  next();
};

export const tugasSayaGuard = (req, res, next) => {
  req.query.my_tasks = true;
  next();
};

export default {
  pelaksanaRoleGuard,
  spjSelfGuard,
  submitTugasGuard,
  skpPrivacyGuard,
  slipGajiPrivacyGuard,
  tugasSayaGuard
};
