import { Op } from "sequelize";
import Role from "../models/Role.js";
import RoleModulePermission from "../models/RoleModulePermission.js";

const roleCodeCache = new Map();

function normalizeRoleCode(roleCode) {
  if (!roleCode) return null;
  return String(roleCode).trim().toLowerCase();
}

async function resolveRoleCode(user) {
  if (!user) return null;

  const directRole = normalizeRoleCode(user.role || user.role_code);
  if (directRole) return directRole;

  const roleId = user.role_id;
  if (!roleId) return null;

  if (roleCodeCache.has(roleId)) {
    return roleCodeCache.get(roleId);
  }

  const role = await Role.findByPk(roleId);
  const roleCode = normalizeRoleCode(role?.code || role?.name);

  if (roleCode) {
    roleCodeCache.set(roleId, roleCode);
  }

  return roleCode;
}

async function hasPermission(roleCode, permission, moduleKey = "*") {
  const normalizedRole = normalizeRoleCode(roleCode);
  if (!normalizedRole) return false;

  if (normalizedRole === "super_admin") return true;

  const normalizedPermission = String(permission || "").trim();
  const normalizedModuleKey = String(moduleKey || "*")
    .trim()
    .toLowerCase();

  const permissionRow = await RoleModulePermission.findOne({
    where: {
      role_code: normalizedRole,
      is_active: true,
      permission: {
        [Op.in]: [normalizedPermission, "*"],
      },
      module_key: {
        [Op.in]: [normalizedModuleKey, "*"],
      },
    },
  });

  if (permissionRow) return true;

  const role = await Role.findOne({ where: { code: normalizedRole } });
  const fallbackPermissions = Array.isArray(role?.default_permissions)
    ? role.default_permissions
    : [];

  return (
    fallbackPermissions.includes("*") ||
    fallbackPermissions.includes(normalizedPermission)
  );
}

function requireRole(...allowedRoles) {
  const normalizedAllowed = allowedRoles
    .map((role) => normalizeRoleCode(role))
    .filter(Boolean);

  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const roleCode = await resolveRoleCode(req.user);
      if (!roleCode) {
        return res.status(403).json({
          success: false,
          message: "Role tidak ditemukan untuk user ini",
        });
      }

      req.user.role = roleCode;
      req.user.role_code = roleCode;

      if (
        normalizedAllowed.length > 0 &&
        !normalizedAllowed.includes(roleCode)
      ) {
        return res.status(403).json({
          success: false,
          message: `Akses ditolak. Role diperlukan: ${normalizedAllowed.join(", ")}`,
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Gagal melakukan validasi role",
        error: error.message,
      });
    }
  };
}

function requirePermission(permission, options = {}) {
  const moduleKey = options.moduleKey || "*";

  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }

      const roleCode = await resolveRoleCode(req.user);
      if (!roleCode) {
        return res.status(403).json({
          success: false,
          message: "Role tidak ditemukan untuk user ini",
        });
      }

      req.user.role = roleCode;
      req.user.role_code = roleCode;

      const allowed = await hasPermission(roleCode, permission, moduleKey);
      if (!allowed) {
        return res.status(403).json({
          success: false,
          message: `Permission '${permission}' tidak dimiliki role '${roleCode}'`,
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Gagal melakukan validasi permission",
        error: error.message,
      });
    }
  };
}

export { hasPermission, requirePermission, requireRole, resolveRoleCode };
