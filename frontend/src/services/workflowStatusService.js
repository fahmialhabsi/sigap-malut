// src/services/workflowStatusService.js
import api from "./apiClient";

// Throttle/dedupe workflow status updates per user+module to avoid repeated
// requests caused by StrictMode double-mounts or remount loops. Uses
// localStorage to remember the last-sent timestamp for (userId, modulId).
export async function workflowStatusUpdateAPI({
  user,
  modulId,
  status,
  detail,
}) {
  try {
    if (!user || !user.id || !modulId) return null;
    const key = `workflow_status_sent:${user.id}:${modulId}`;
    const now = Date.now();
    const last = parseInt(localStorage.getItem(key) || "0", 10) || 0;
    // if last sent within 30 seconds, skip
    if (now - last < 30 * 1000) {
      console.debug("workflowStatusUpdateAPI: skipped (recently sent)", {
        user: user.id,
        modulId,
      });
      return null;
    }

    const res = await api.post("/workflow-status", {
      user,
      modulId,
      status,
      detail,
    });
    localStorage.setItem(key, String(Date.now()));
    return res;
  } catch (err) {
    console.warn("workflowStatusUpdateAPI failed:", err?.message || err);
    return null;
  }
}

export async function getWorkflowStatusAPI() {
  return api.get("/workflow-status");
}
