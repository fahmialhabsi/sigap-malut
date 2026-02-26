import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mappingPath = path.join(
  __dirname,
  "..",
  "config",
  "roleModuleMapping.json",
);
let roleMap = {};
try {
  roleMap = JSON.parse(fs.readFileSync(mappingPath, "utf8"));
} catch (e) {
  roleMap = { roles: {} };
}

export function hasPermission(role, permission) {
  if (!role) return false;
  const r = roleMap.roles[role];
  if (!r) return false;
  if (r.permissions && r.permissions.includes("*")) return true;
  return r.permissions && r.permissions.includes(permission);
}

export function authorize(permission) {
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
