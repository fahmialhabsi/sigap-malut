// services/approvalService.js
import api from "./apiClient";

export async function submitForApprovalAPI({ user, modulId, dataId, detail }) {
  return api.post("/approval", { user, modulId, dataId, detail });
}

export async function updateApprovalStatusAPI({
  user,
  modulId,
  dataId,
  status,
  detail,
}) {
  return api.put(`/approval/${modulId}/${dataId}`, { user, status, detail });
}

export async function getApprovalWorkflowAPI() {
  return api.get("/approval");
}
