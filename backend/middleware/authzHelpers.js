export function ensureScope(req, scope) {
  if (!req.user || !req.user.scopes || !req.user.scopes.includes(scope)) {
    throw new Error("Insufficient scope/permission");
  }
}

export function canOperateOnInstitution(user, institution_id) {
  if (!user) return false;
  if (user.roles && user.roles.includes("system_admin")) return true;
  if (user.institutions && user.institutions.includes(institution_id))
    return true;
  return false;
}

export function isSystemAdmin(user) {
  return user && user.roles && user.roles.includes("system_admin");
}
