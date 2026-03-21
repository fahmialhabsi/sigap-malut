// services/reportingService.js
import api from "./apiClient";

export async function generateReportAPI({ user, modulId, periode, tipe }) {
  return api.post("/report", { user, modulId, periode, tipe });
}

export async function approveReportAPI({ user, modulId, periode, tipe }) {
  return api.put(`/report/${modulId}/${periode}/approve`, { user, tipe });
}

export async function getReportsAPI() {
  return api.get("/report");
}
