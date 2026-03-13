// utils/auditTrail.js
// Sederhana: log aktivitas user ke localStorage (bisa diintegrasi backend nanti)
import { logAuditTrailAPI } from "../services/auditTrailService";

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

  // Fire and forget sync to backend persistence.
  logAuditTrailAPI({ user, action, detail }).catch(() => {});
}

export function getAuditTrail() {
  return JSON.parse(localStorage.getItem("auditTrail") || "[]");
}

export function clearAuditTrail() {
  localStorage.removeItem("auditTrail");
}
