// @desc    Check if user has required role
// @usage   router.get('/admin', protect, authorize('super_admin', 'kepala_dinas'), controller)
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Silakan login terlebih dahulu",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' tidak memiliki akses ke resource ini. Diperlukan role: ${roles.join(", ")}`,
      });
    }

    next();
  };
};

// @desc    Check if user is from specific unit_kerja
// @usage   router.get('/sekretariat', protect, checkUnit('Sekretariat'), controller)
export const checkUnit = (...units) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Silakan login terlebih dahulu",
      });
    }

    if (!units.includes(req.user.unit_kerja)) {
      return res.status(403).json({
        success: false,
        message: `Unit kerja '${req.user.unit_kerja}' tidak memiliki akses. Diperlukan: ${units.join(", ")}`,
      });
    }

    next();
  };
};

// @desc    Check if user is Eselon IV or higher (Verifikator)
export const requireVerifikator = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Silakan login terlebih dahulu",
    });
  }

  const verifikatorRoles = [
    "super_admin",
    "kepala_dinas",
    "sekretaris",
    "kepala_bidang",
    "kepala_uptd",
    "kasubbag",
    "kasubbag_umum",
    "kasubbag_kepegawaian",
    "kasubbag_perencanaan",
    "kasi_uptd",
    "kasubbag_tu_uptd",
    "kasi_mutu_uptd",
    "kasi_teknis_uptd",
    "fungsional",
    "fungsional_perencana",
    "fungsional_analis",
  ];

  if (!verifikatorRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message:
        "Hanya verifikator (Eselon IV ke atas atau Fungsional) yang dapat mengakses fitur ini",
    });
  }

  next();
};

// @desc    Check if user is Eselon III or higher (Approver)
export const requireApprover = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Silakan login terlebih dahulu",
    });
  }

  const approverRoles = [
    "super_admin",
    "kepala_dinas",
    "sekretaris",
    "kepala_bidang",
    "kepala_uptd",
  ];

  if (!approverRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Hanya Eselon III ke atas yang dapat melakukan approval",
    });
  }

  next();
};

// @desc    Check if user can access data from specific unit
export const canAccessUnit = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Silakan login terlebih dahulu",
    });
  }

  // Super admin dan kepala dinas bisa akses semua unit
  if (["super_admin", "kepala_dinas"].includes(req.user.role)) {
    return next();
  }

  // Sekretaris bisa akses semua unit (sebagai hub data)
  if (req.user.role === "sekretaris") {
    return next();
  }

  // Check if requesting data from own unit
  const requestedUnit = req.query.unit_kerja || req.body.unit_kerja;

  if (requestedUnit && requestedUnit !== req.user.unit_kerja) {
    return res.status(403).json({
      success: false,
      message: `Anda hanya dapat mengakses data dari unit kerja sendiri: ${req.user.unit_kerja}`,
    });
  }

  next();
};

// @desc    Role hierarchy check
export const getRoleLevel = (role) => {
  const hierarchy = {
    super_admin: 10,
    kepala_dinas: 9, // Eselon II
    sekretaris: 8, // Eselon III
    kepala_bidang: 8, // Eselon III
    kepala_uptd: 8, // Eselon III
    kasubbag: 7, // Eselon IV (Sekretariat)
    kasubbag_umum: 7,
    kasubbag_kepegawaian: 7,
    kasubbag_perencanaan: 7,
    kasi_uptd: 7, // Eselon IV (UPTD)
    kasubbag_tu_uptd: 7,
    kasi_mutu_uptd: 7,
    kasi_teknis_uptd: 7,
    fungsional: 6, // Fungsional (pengganti Eselon IV di Bidang)
    fungsional_perencana: 6,
    fungsional_analis: 6,
    pelaksana: 5, // Staff/Pelaksana
    guest: 0,
  };

  return hierarchy[role] || 0;
};

// @desc    Check if user has sufficient role level
export const requireMinLevel = (minLevel) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Silakan login terlebih dahulu",
      });
    }

    const userLevel = getRoleLevel(req.user.role);

    if (userLevel < minLevel) {
      return res.status(403).json({
        success: false,
        message: "Level akses tidak mencukupi untuk resource ini",
      });
    }

    next();
  };
};
export default {
  authorize,
  checkUnit,
  requireVerifikator,
  requireApprover,
  canAccessUnit,
  getRoleLevel,
  requireMinLevel,
};
