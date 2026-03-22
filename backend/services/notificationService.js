// notificationService.js
// Service untuk mengirim notifikasi webhook (Slack/email) dan DB in-app

import axios from "axios";
import Notification from "../models/Notification.js";

export async function sendSlackNotification(message) {
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!slackWebhookUrl) return;
  try {
    await axios.post(slackWebhookUrl, { text: message });
  } catch (err) {
    console.error("Slack notification failed:", err.message);
  }
}

export async function sendEmailNotification(subject, body) {
  // Implementasi email bisa menggunakan nodemailer atau service lain
  console.log("Email notification:", subject, body);
}

/** Buat notifikasi in-app yang disimpan di DB */
export async function createNotification(
  targetUserId,
  taskId,
  message,
  link = null,
) {
  if (!targetUserId) return null;
  return Notification.create({
    target_user_id: targetUserId,
    task_id: taskId,
    message,
    link,
    channel: "in_app",
  }).catch(() => null);
}

/** Hitung notifikasi belum dibaca milik user */
export async function getUnreadCount(userId) {
  return Notification.count({
    where: { target_user_id: userId, seen: false },
  }).catch(() => 0);
}
