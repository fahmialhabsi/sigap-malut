// utils/auditTrail.js
// Sederhana: log aktivitas user ke localStorage (bisa diintegrasi backend nanti)

export function logAuditTrail({ user, action, detail }) {
  const now = new Date().toISOString();
  const entry = {
    user: user?.username || "anonymous",
    role: user?.role || "unknown",
    action,
    detail,
    time: now,
  };
  const logs = JSON.parse(localStorage.getItem("auditTrail") || "[]");
  logs.push(entry);
  localStorage.setItem("auditTrail", JSON.stringify(logs));
}

export function getAuditTrail() {
  return JSON.parse(localStorage.getItem("auditTrail") || "[]");
}

export function clearAuditTrail() {
  localStorage.removeItem("auditTrail");
}
