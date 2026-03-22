/**
 * backend/middleware/permissionCheck.js
 *
 * Authoritative backend RBAC middleware untuk SIGAP MALUT.
 *
 * Usage:
 *   import { requirePermission, requireAnyPermission } from '../middleware/permissionCheck.js';
 *
 *   // Require single permission
 *   router.get('/', protect, requirePermission('sek-keu', 'read'), controller);
 *
 *   // Require any of multiple permissions
 *   router.post('/', protect, requireAnyPermission([
 *     'sek-keu:create', 'sek-keu:approve'
 *   ]), controller);
 *
 *   // Self-data override: user can access own records regardless of role
 *   router.get('/:id', protect, requirePermission('sek-kep', 'read', { allowSelf: true }), controller);
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Load permission matrix ────────────────────────────────────────────────────
let _matrix = null;

function getMatrix() {
  if (_matrix) return _matrix;
  const p = path.join(__dirname, "..", "config", "roleModuleMapping.json");
  try {
    _matrix = JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    _matrix = { roles: {}, fieldMasks: {} };
  }
  return _matrix;
}

// Invalidate cache when file changes (dev hot-reload friendly)
let _watchStarted = false;
function watchMatrix() {
  if (_watchStarted) return;
  _watchStarted = true;
  try {
    const p = path.join(__dirname, "..", "config", "roleModuleMapping.json");
    fs.watch(p, () => {
      _matrix = null;
    });
  } catch {
    /* ignore */
  }
}
watchMatrix();

// ── Core permission resolver ──────────────────────────────────────────────────

/**
 * @param {string} role        - req.user.role (e.g. 'bendahara')
 * @param {string} module      - module name (e.g. 'sek-keu')
 * @param {string} action      - action name (e.g. 'read', 'create', 'update', 'delete', 'approve')
 * @returns {boolean}
 */
export function hasModulePermission(role, module, action) {
  if (!role) return false;
  const matrix = getMatrix();
  const roleConfig = matrix.roles?.[role];
  if (!roleConfig) return false;

  const perms = roleConfig.permissions || [];

  // Wildcard — super_admin or global admin
  if (perms.includes("*")) return true;

  const target = `${module}:${action}`;
  const moduleWildcard = `${module}:*`;

  return perms.includes(target) || perms.includes(moduleWildcard);
}

/**
 * Check any of a set of full permission strings (e.g. ['sek-keu:read', 'sek-keu:approve'])
 */
export function hasAnyPermission(role, permissionList) {
  if (!role) return false;
  const matrix = getMatrix();
  const roleConfig = matrix.roles?.[role];
  if (!roleConfig) return false;

  const perms = roleConfig.permissions || [];
  if (perms.includes("*")) return true;

  return permissionList.some((p) => perms.includes(p));
}

// ── Middleware factories ──────────────────────────────────────────────────────

/**
 * requirePermission(module, action, options?)
 *
 * Options:
 *  - allowSelf: boolean — if true, passes if req.params.id === req.user.id
 *  - ownerField: string — field on req.body/query to compare against req.user.id (default: 'id')
 */
export function requirePermission(module, action, options = {}) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Tidak terautentikasi. Silakan login terlebih dahulu.",
      });
    }

    const role = req.user.role;

    // Self-access override
    if (options.allowSelf) {
      const paramId = req.params?.id;
      const userId = String(req.user.id);
      if (paramId && String(paramId) === userId) return next();
    }

    if (hasModulePermission(role, module, action)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Akses ditolak. Role '${role}' tidak memiliki izin '${module}:${action}'.`,
      required: `${module}:${action}`,
      userRole: role,
    });
  };
}

/**
 * requireAnyPermission([...permissionStrings])
 * Passes if user has at least one of the listed full permission strings.
 */
export function requireAnyPermission(permissionList) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Tidak terautentikasi. Silakan login terlebih dahulu.",
      });
    }

    if (hasAnyPermission(req.user.role, permissionList)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Akses ditolak. Diperlukan salah satu dari: ${permissionList.join(", ")}.`,
      userRole: req.user.role,
    });
  };
}

/**
 * requireMinRoleLevel(minLevel)
 * Uses numeric hierarchy from roleCheck.js.
 * Levels: super_admin=10, kepala_dinas=9, sekretaris/kepala_bidang=8,
 *         kasubbag=7, fungsional=6, pelaksana=5, guest=0
 */
const ROLE_LEVELS = {
  super_admin: 10,
  kepala_dinas: 9,
  sekretaris: 8,
  kepala_bidang: 8,
  kepala_bidang_distribusi: 8,
  kepala_uptd: 8,
  kasubbag: 7,
  kasubbag_umum: 7,
  kasubbag_kepegawaian: 7,
  kasubbag_perencanaan: 7,
  kasi_uptd: 7,
  kasubbag_tu_uptd: 7,
  kasi_mutu_uptd: 7,
  kasi_teknis_uptd: 7,
  fungsional: 6,
  fungsional_perencana: 6,
  fungsional_analis: 6,
  bendahara: 6,
  staf_pelaksana: 5,
  pelaksana: 5,
  guest: 0,
};

export function requireMinRoleLevel(minLevel) {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Tidak terautentikasi." });
    }
    const level = ROLE_LEVELS[req.user.role] ?? 0;
    if (level >= minLevel) return next();
    return res.status(403).json({
      success: false,
      message: `Level akses tidak mencukupi (diperlukan level ${minLevel}, role Anda: ${req.user.role} = ${level}).`,
    });
  };
}

/**
 * requireOwnerOrRole(roles[])
 * Passes if req.params.id === req.user.id OR user has one of the listed roles.
 */
export function requireOwnerOrRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Tidak terautentikasi." });
    }
    const isOwner =
      req.params?.id && String(req.params.id) === String(req.user.id);
    const hasRole = roles.includes(req.user.role);
    if (isOwner || hasRole) return next();
    return res.status(403).json({
      success: false,
      message: `Akses ditolak. Hanya pemilik data atau role [${roles.join(", ")}] yang diizinkan.`,
    });
  };
}

export default {
  requirePermission,
  requireAnyPermission,
  requireMinRoleLevel,
  requireOwnerOrRole,
  hasModulePermission,
  hasAnyPermission,
};
