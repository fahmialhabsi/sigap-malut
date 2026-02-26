const fs = require("fs");
const path = require("path");

const mappingPath = path.join(
  __dirname,
  "..",
  "config",
  "roleModuleMapping.json",
);
let roleMap = {};
try {
  roleMap = require(mappingPath);
} catch (e) {
  roleMap = { roles: {} };
}

function hasPermission(role, permission) {
  if (!role) return false;
  const r = roleMap.roles[role];
  if (!r) return false;
  if (r.permissions.includes("*")) return true;
  return r.permissions.includes(permission);
}

function authorize(permission) {
  return (req, res, next) => {
    try {
      const user = req.user; // set by auth middleware
      if (!user) return res.status(401).json({ error: "unauthenticated" });
      if (hasPermission(user.role, permission)) return next();
      return res.status(403).json({ error: "forbidden" });
    } catch (e) {
      next(e);
    }
  };
}

module.exports = { authorize, hasPermission };
