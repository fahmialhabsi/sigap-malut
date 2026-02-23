// src/services/workflowStatusService.js
import api from "./apiClient";

export async function workflowStatusUpdateAPI({
  user,
  modulId,
  status,
  detail,
}) {
  return api.post("/workflow-status", { user, modulId, status, detail });
}

export async function getWorkflowStatusAPI() {
  return api.get("/workflow-status");
}
