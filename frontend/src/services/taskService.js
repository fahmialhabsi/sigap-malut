// services/taskService.js — Wrapper untuk Task/Perintah Management API
import api from "./apiClient.js";

export const taskService = {
  // ─── CRUD ────────────────────────────────────────────────────────────────
  list: (params = {}) => api.get("/tasks", { params }),
  detail: (id) => api.get(`/tasks/${id}`),
  create: (data) => api.post("/tasks", data),
  summary: () => api.get("/tasks/dashboard/summary"),

  // ─── Lifecycle transitions ───────────────────────────────────────────────
  assign: (id, data) => api.post(`/tasks/${id}/assign`, data),
  accept: (id) => api.post(`/tasks/${id}/accept`),
  rejectAssignment: (id, note) =>
    api.post(`/tasks/${id}/reject-assignment`, { note }),
  start: (id) => api.post(`/tasks/${id}/start`),
  submit: (id, note) => api.post(`/tasks/${id}/submit`, { note }),
  verify: (id, decision, note) =>
    api.post(`/tasks/${id}/verify`, { decision, note }),
  review: (id, decision, note) =>
    api.post(`/tasks/${id}/review`, { decision, note }),
  close: (id, note) => api.post(`/tasks/${id}/close`, { note }),
  reject: (id, note) => api.post(`/tasks/${id}/reject`, { note }),
  escalate: (id, note) => api.post(`/tasks/${id}/escalate`, { note }),
  reopen: (id) => api.post(`/tasks/${id}/reopen`),

  // ─── Files ───────────────────────────────────────────────────────────────
  uploadFiles: (id, formData) =>
    api.post(`/tasks/${id}/files`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  downloadFileUrl: (id, fileId) => `/api/tasks/${id}/files/${fileId}`,
};

export const notificationService = {
  list: (params = {}) => api.get("/notifications", { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put("/notifications/read-all"),
};
