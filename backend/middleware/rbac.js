import {
  hasPermission as hasPermissionFromDb,
  requirePermission,
} from "./rbacMiddleware.js";

async function hasPermission(role, permission, moduleKey = "*") {
  return hasPermissionFromDb(role, permission, moduleKey);
}

function authorize(permission, moduleKey = "*") {
  return requirePermission(permission, { moduleKey });
}

export { authorize, hasPermission };
