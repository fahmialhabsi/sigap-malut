// utils/workflowHooks.js
// Sederhana: workflow hooks untuk tracking status alur dan audit trail
import { logAuditTrail } from "./auditTrail";

export function workflowStatusUpdate({ user, modulId, status, detail }) {
  // Simpan status alur ke localStorage (bisa diintegrasi backend)
  const now = new Date().toISOString();
  const entry = { user: user?.username, modulId, status, detail, time: now };
  const logs = JSON.parse(localStorage.getItem("workflowStatus") || "[]");
  logs.push(entry);
  localStorage.setItem("workflowStatus", JSON.stringify(logs));
  // Audit trail juga
  logAuditTrail({
    user,
    action: `workflow:${status}`,
    detail: `Modul ${modulId}: ${detail}`,
  });
}

export function getWorkflowStatus() {
  return JSON.parse(localStorage.getItem("workflowStatus") || "[]");
}

export function clearWorkflowStatus() {
  localStorage.removeItem("workflowStatus");
}
