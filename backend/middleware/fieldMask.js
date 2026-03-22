/**
 * backend/middleware/fieldMask.js
 *
 * Field-level masking middleware untuk SIGAP MALUT.
 * Melindungi field sensitif (gaji, NIP, anggaran) dari role yang tidak berwenang.
 *
 * Usage:
 *   import { maskFields } from '../middleware/fieldMask.js';
 *
 *   // On a route — mask sensitive fields for unauthorized roles
 *   router.get('/', protect, maskFields('sek-keu'), getAllSekKeu);
 *
 *   // With custom override
 *   router.get('/', protect, maskFields('sek-kep', {
 *     extraFields: ['alamat_rumah'],
 *     extraAllowedRoles: ['kasubbag_kepegawaian'],
 *   }), getAllSekKep);
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Load field mask config ────────────────────────────────────────────────────
let _config = null;

function getConfig() {
  if (_config) return _config;
  const p = path.join(__dirname, "..", "config", "roleModuleMapping.json");
  try {
    const raw = JSON.parse(fs.readFileSync(p, "utf8"));
    _config = raw.fieldMasks || {};
  } catch {
    _config = {};
  }
  return _config;
}

// Invalidate cache when file changes
let _watchStarted = false;
function watchConfig() {
  if (_watchStarted) return;
  _watchStarted = true;
  try {
    const p = path.join(__dirname, "..", "config", "roleModuleMapping.json");
    fs.watch(p, () => {
      _config = null;
    });
  } catch {
    /* ignore */
  }
}
watchConfig();

// ── Core masking logic ────────────────────────────────────────────────────────
const MASK_VALUE = "***";

/**
 * Recursively mask fields in an object or array.
 * @param {any} obj          - data to mask
 * @param {string[]} fields  - field names to mask
 * @returns {any}            - masked copy
 */
function maskObject(obj, fields) {
  if (Array.isArray(obj)) {
    return obj.map((item) => maskObject(item, fields));
  }
  if (obj !== null && typeof obj === "object") {
    const result = {};
    for (const [key, val] of Object.entries(obj)) {
      result[key] = fields.includes(key) ? MASK_VALUE : maskObject(val, fields);
    }
    return result;
  }
  return obj;
}

// ── Intercept res.json ────────────────────────────────────────────────────────
/**
 * maskFields(module, overrides?)
 *
 * Intercepts res.json() and strips/masks sensitive fields if the user's role
 * is not in the allowedRoles list for the given module.
 *
 * overrides = {
 *   extraFields: string[],         // additional fields to mask
 *   extraAllowedRoles: string[],   // additional roles that can see fields
 * }
 */
export function maskFields(module, overrides = {}) {
  return (req, res, next) => {
    const config = getConfig();
    const moduleConfig = config[module];

    if (!moduleConfig) return next(); // no mask config for this module

    const role = req.user?.role;
    const matrix = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "..", "config", "roleModuleMapping.json"),
        "utf8",
      ),
    );

    // Roles that can see sensitive fields: from module config + overrides
    const allowedRoles = [
      ...(moduleConfig.allowedRoles || []),
      ...(overrides.extraAllowedRoles || []),
    ];

    // Fields to mask: from module config + overrides
    const sensitiveFields = [
      ...(moduleConfig.sensitiveFields || []),
      ...(overrides.extraFields || []),
    ];

    // Role-level wildcard fields
    const roleConfig = matrix.roles?.[role];
    const roleSensitiveFields = roleConfig?.sensitiveFields || [];
    // If role has sensitiveFields: ['*'], it means they can see everything
    const roleCanSeeAll =
      roleSensitiveFields.includes("*") || role === "super_admin";

    // If user is allowed or has wildcard access, skip masking
    if (roleCanSeeAll || allowedRoles.includes(role)) {
      return next();
    }

    // Intercept res.json
    const originalJson = res.json.bind(res);
    res.json = function (body) {
      try {
        const masked = maskObject(body, sensitiveFields);
        return originalJson(masked);
      } catch {
        return originalJson(body);
      }
    };

    next();
  };
}

/**
 * maskFieldsInline(sensitiveFields, allowedRoles)
 * Quick inline version without module config lookup.
 */
export function maskFieldsInline(sensitiveFields, allowedRoles) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role || role === "super_admin" || allowedRoles.includes(role)) {
      return next();
    }

    const originalJson = res.json.bind(res);
    res.json = function (body) {
      try {
        const masked = maskObject(body, sensitiveFields);
        return originalJson(masked);
      } catch {
        return originalJson(body);
      }
    };

    next();
  };
}

export default { maskFields, maskFieldsInline };
