// services/caseService.js
import api from "./apiClient";

export async function createCaseAPI({
  user,
  modulId,
  dataId,
  alertType,
  pesan,
}) {
  return api.post("/case", { user, modulId, dataId, alertType, pesan });
}

export async function updateCaseStatusAPI(id, status) {
  return api.put(`/case/${id}/status`, { status });
}

export async function getCasesAPI() {
  return api.get("/case");
}
