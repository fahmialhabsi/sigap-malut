// utils/reportingWorkflow.js
// Workflow Pelaporan Otomatis
import { logAuditTrail } from "./auditTrail";

export function generateReport({ user, modulId, periode, tipe }) {
  const now = new Date().toISOString();
  const entry = {
    user: user?.username,
    modulId,
    periode,
    tipe,
    status: "generated",
    time: now,
  };
  const logs = JSON.parse(localStorage.getItem("reportLogs") || "[]");
  logs.push(entry);
  localStorage.setItem("reportLogs", JSON.stringify(logs));
  logAuditTrail({
    user,
    action: "report-generate",
    detail: `Generate report ${tipe} modul ${modulId} periode ${periode}`,
  });
}

export function approveReport({ user, modulId, periode, tipe }) {
  const now = new Date().toISOString();
  const logs = JSON.parse(localStorage.getItem("reportLogs") || "[]");
  logs.push({
    user: user?.username,
    modulId,
    periode,
    tipe,
    status: "approved",
    time: now,
  });
  localStorage.setItem("reportLogs", JSON.stringify(logs));
  logAuditTrail({
    user,
    action: "report-approve",
    detail: `Approve report ${tipe} modul ${modulId} periode ${periode}`,
  });
}

export function getReports() {
  return JSON.parse(localStorage.getItem("reportLogs") || "[]");
}

export function clearReports() {
  localStorage.removeItem("reportLogs");
}
