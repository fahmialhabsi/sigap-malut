// utils/approvalWorkflow.js
// Approval workflow berjenjang: draft, diajukan, diverifikasi, disetujui, ditolak, revisi
import { logAuditTrail } from "./auditTrail";

export const APPROVAL_STATUS = [
  "draft",
  "diajukan",
  "diverifikasi",
  "disetujui",
  "ditolak",
  "revisi",
];

export function submitForApproval({ user, modulId, dataId, detail }) {
  const now = new Date().toISOString();
  const entry = {
    user: user?.username,
    modulId,
    dataId,
    status: "diajukan",
    detail,
    time: now,
  };
  const logs = JSON.parse(localStorage.getItem("approvalWorkflow") || "[]");
  logs.push(entry);
  localStorage.setItem("approvalWorkflow", JSON.stringify(logs));
  logAuditTrail({
    user,
    action: "submit-approval",
    detail: `Ajukan approval modul ${modulId} data ${dataId}`,
  });
}

export function updateApprovalStatus({
  user,
  modulId,
  dataId,
  status,
  detail,
}) {
  const now = new Date().toISOString();
  const logs = JSON.parse(localStorage.getItem("approvalWorkflow") || "[]");
  logs.push({
    user: user?.username,
    modulId,
    dataId,
    status,
    detail,
    time: now,
  });
  localStorage.setItem("approvalWorkflow", JSON.stringify(logs));
  logAuditTrail({
    user,
    action: `approval:${status}`,
    detail: `Status ${status} modul ${modulId} data ${dataId}`,
  });
}

export function getApprovalWorkflow() {
  return JSON.parse(localStorage.getItem("approvalWorkflow") || "[]");
}

export function clearApprovalWorkflow() {
  localStorage.removeItem("approvalWorkflow");
}
