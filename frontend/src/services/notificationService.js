// services/notificationService.js
// Automasi notifikasi (dummy, bisa dihubungkan ke backend/email/websocket)
import api from "./apiClient";

export async function sendNotificationAPI({ user, type, message, target }) {
  return api.post("/notification", { user, type, message, target });
}
