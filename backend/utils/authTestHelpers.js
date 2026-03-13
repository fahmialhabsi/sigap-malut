// Test-only auth helpers. Keep production middleware free from mock logic.
export function validateInput({ username, password }) {
  if (!username || !password) {
    throw new Error("Invalid input");
  }

  return true;
}

export function generateJWT({ id, role }) {
  return `mock-token-${id}-${role}`;
}

export function checkRBAC(token, role) {
  return String(token || "").includes(String(role || ""));
}
