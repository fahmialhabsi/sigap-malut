// utils/workflowHooks.js
// Sederhana: workflow hooks untuk tracking status alur dan audit trail
import { logAuditTrail } from "./auditTrail";
import { workflowStatusUpdateAPI } from "../services/workflowStatusService";

export function workflowStatusUpdate({ user, modulId, status, detail }) {
  // Simpan status alur ke localStorage (bisa diintegrasi backend)
  const now = new Date().toISOString();
  const entry = { user: user?.username, modulId, status, detail, time: now };
  const logs = JSON.parse(localStorage.getItem("workflowStatus") || "[]");
  logs.push(entry);
  localStorage.setItem("workflowStatus", JSON.stringify(logs));

  // Fire and forget sync to backend workflow log.
  // Only send valid workflow states
  const validStates = [
    "draft",
    "submitted",
    "assigned",
    "in_progress",
    "submitted_for_verification",
    "verified",
    "analyzed",
    "approved_by_unit",
    "reviewed_by_secretary",
    "approved_by_secretary",
    "forwarded_to_kepala_dinas",
    "closed",
    "rejected",
    "escalated",
  ];
  if (validStates.includes(status)) {
    workflowStatusUpdateAPI({ user, modulId, status, detail }).catch(() => {});
  } else {
    // Optionally log or fallback
    workflowStatusUpdateAPI({ user, modulId, status: "draft", detail }).catch(
      () => {},
    );
  }

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
