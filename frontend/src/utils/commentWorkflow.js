// utils/commentWorkflow.js
// Workflow Kolaborasi & Komentar
import { logAuditTrail } from "./auditTrail";

export function addComment({ user, modulId, dataId, komentar }) {
  const now = new Date().toISOString();
  const entry = { user: user?.username, modulId, dataId, komentar, time: now };
  const logs = JSON.parse(localStorage.getItem("commentLogs") || "[]");
  logs.push(entry);
  localStorage.setItem("commentLogs", JSON.stringify(logs));
  logAuditTrail({
    user,
    action: "comment",
    detail: `Komentar modul ${modulId} data ${dataId}`,
  });
}

export function getComments({ modulId, dataId }) {
  const logs = JSON.parse(localStorage.getItem("commentLogs") || "[]");
  return logs.filter((l) => l.modulId === modulId && l.dataId === dataId);
}

export function getAllComments() {
  return JSON.parse(localStorage.getItem("commentLogs") || "[]");
}

export function clearComments() {
  localStorage.removeItem("commentLogs");
}
