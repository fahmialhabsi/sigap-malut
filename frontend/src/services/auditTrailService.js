// services/auditTrailService.js
import api from "./apiClient";

export async function logAuditTrailAPI({ user, action, detail }) {
  return api.post("/audit-trail", { user, action, detail });
}

export async function getAuditTrailAPI() {
  return api.get("/audit-trail");
}
