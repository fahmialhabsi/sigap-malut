// notificationService.js
// Service untuk mengirim notifikasi webhook (Slack/email)

import axios from "axios";

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
  // Contoh placeholder:
  console.log("Email notification:", subject, body);
}
