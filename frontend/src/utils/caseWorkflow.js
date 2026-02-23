// utils/caseWorkflow.js
// Workflow Penanganan Alert/Kasus
import { logAuditTrail } from "./auditTrail";

export function createCase({ user, modulId, dataId, alertType, pesan }) {
  const now = new Date().toISOString();
  const entry = {
    user: user?.username,
    modulId,
    dataId,
    alertType,
    pesan,
    status: "open",
    created: now,
  };
  const logs = JSON.parse(localStorage.getItem("caseLogs") || "[]");
  logs.push(entry);
  localStorage.setItem("caseLogs", JSON.stringify(logs));
  logAuditTrail({
    user,
    action: "case-open",
    detail: `Case ${alertType} modul ${modulId} data ${dataId}`,
  });
}

export function updateCaseStatus(index, status) {
  const logs = JSON.parse(localStorage.getItem("caseLogs") || "[]");
  if (logs[index]) logs[index].status = status;
  localStorage.setItem("caseLogs", JSON.stringify(logs));
}

export function getCases() {
  return JSON.parse(localStorage.getItem("caseLogs") || "[]");
}

export function clearCases() {
  localStorage.removeItem("caseLogs");
}
