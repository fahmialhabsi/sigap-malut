// backend/middleware/pelaksanaRoleGuard.js
// Guard untuk endpoint Pelaksana SEKRETARIAT — hanya role 'pelaksana'

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
  const userId = req.user.id;
  const { penerima_uang_id, atas_nama_id } = req.body;
  
  const claimedId = penerima_uang_id || atas_nama_id;
  if (claimedId && String(claimedId) !== String(userId)) {
    return res.status(403).json({
      success: false,
      error: 'SPJ_ATAS_NAMA_ORANG_LAIN',
      message: 'Anda hanya boleh membuat SPJ untuk diri sendiri. Bendahara/Pelaksana lain buat SPJ mereka sendiri.'
    });
  }
  
  // Paksa field identitas diri sendiri
  req.body.dibuat_oleh = userId;
  req.body.penerima_uang_id = userId;
  next();
};

// Guard: Submit tugas WAJIB ke atasan langsung via user_hierarchy
export const submitTugasGuard = async (req, res, next) => {
  try {
    const { submit_ke } = req.body; // opsional, jika ada
    const userId = req.user.id;
    
    // Query atasan primer dari user_hierarchy
    const UserHierarchy = require('../models/UserHierarchy'); // lazy import
    const atasan = await UserHierarchy.findOne({
      where: { 
        bawahan_id: userId, 
        adalah_primer: true,
        deleted_at: null 
      }
    });
    
    if (submit_ke && atasan && String(submit_ke) !== String(atasan.atasan_id)) {
      return res.status(403).json({
        success: false,
        error: 'BYPASS_HIERARCHY',
        message: `Tugas harus disubmit ke atasan langsung (ID: ${atasan.atasan_id}, Role: ${atasan.role_atasan}). Bukan bypass ke ${submit_ke}.`
      });
    }
    
    // Attach atasan info ke req untuk controller
    req.atasanLangsung = atasan;
    next();
  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      message: 'Gagal validasi hierarchy: ' + error.message 
    });
  }
};

// Privacy Guards: Read-only milik sendiri
export const skpPrivacyGuard = (req, res, next) => {
  req.query.dinilai_id = req.user.id; // Paksa filter milik sendiri
  next();
};

export const slipGajiPrivacyGuard = (req, res, next) => {
  req.query.asn_id = req.user.id; // Filter NIP sendiri
  next();
};

export const tugasSayaGuard = (req, res, next) => {
  // Hanya tugas yang assigned ke saya atau dibuat oleh saya
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

