// services/reminderService.js
import api from "./apiClient";

export async function addReminderAPI({
  user,
  modulId,
  dataId,
  pesan,
  dueDate,
}) {
  return api.post("/reminder", { user, modulId, dataId, pesan, dueDate });
}

export async function getRemindersAPI() {
  return api.get("/reminder");
}

export async function completeReminderAPI(id) {
  return api.put(`/reminder/${id}/complete`);
}
