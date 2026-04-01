// backend/middleware/sekretarisGuard.js
// RBAC middleware for Sekretaris dashboard & APIs
// Allow only 'sekretaris' role

import { Op } from 'sequelize';

export const sekretarisGuard = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const allowedRoles = ['sekretaris', 'super_admin'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Sekretaris role required.',
      required_role: 'sekretaris'
    });
  }

  // Optional: Check unit_kerja 'sekretariat'
  if (req.user.unit_kerja && !req.user.unit_kerja.toLowerCase().includes('sekretariat')) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Unit Sekretariat required.'
    });
  }

  next();
};

export default sekretarisGuard;

