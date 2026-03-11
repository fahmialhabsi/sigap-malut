#!/usr/bin/env node
// scripts/checkTaskSLA.js
// Scheduled SLA checker for overdue tasks.
// Run periodically (e.g., every 15 minutes via cron or a job scheduler).
//
// Usage:
//   node scripts/checkTaskSLA.js
//
// Cron example (every 15 min):
//   */15 * * * * node /app/scripts/checkTaskSLA.js >> /var/log/sla-checker.log 2>&1

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from repository root
dotenv.config({ path: path.join(__dirname, "..", ".env") });

// Import sequelize after dotenv so DB config is ready
const { sequelize } = await import("../backend/config/database.js");
const { writeAuditLog, queueNotification } = await import("../backend/utils/auditLogger.js");

async function checkSLA() {
  console.log(`[checkTaskSLA] Starting SLA check at ${new Date().toISOString()}`);

  // Find tasks that have exceeded their SLA and are not yet closed/rejected
  const [overdueTasks] = await sequelize.query(`
    SELECT id, title, status, assigned_to, sla_seconds, due_at, created_at
    FROM tasks
    WHERE sla_seconds IS NOT NULL
      AND status NOT IN ('closed', 'rejected')
      AND (
        due_at < CURRENT_TIMESTAMP
        OR (due_at IS NULL AND datetime(created_at, '+' || sla_seconds || ' seconds') < CURRENT_TIMESTAMP)
      )
  `);

  if (!overdueTasks.length) {
    console.log("[checkTaskSLA] No overdue tasks found.");
    await sequelize.close();
    return;
  }

  console.log(`[checkTaskSLA] Found ${overdueTasks.length} overdue task(s).`);

  for (const task of overdueTasks) {
    console.log(`[checkTaskSLA] Overdue: task_id=${task.id} title="${task.title}" status=${task.status}`);

    // Write audit entry for SLA breach
    await writeAuditLog({
      module: "tasks",
      entity_id: task.id,
      action: "SLA_BREACH",
      data_old: null,
      data_new: { sla_seconds: task.sla_seconds, status: task.status, due_at: task.due_at },
      actor_id: null,
    });

    // Notify the assignee (if any)
    if (task.assigned_to) {
      await queueNotification({
        recipient_id: task.assigned_to,
        channel: "in_app",
        subject: `⚠️ SLA Melewati Batas: ${task.title}`,
        body: `Tugas "${task.title}" telah melewati batas waktu SLA. Segera tindak lanjuti.`,
        metadata: { task_id: task.id, action: "SLA_BREACH" },
      });
    }
  }

  await sequelize.close();
  console.log(`[checkTaskSLA] Done. Checked at ${new Date().toISOString()}`);
}

checkSLA().catch((err) => {
  console.error("[checkTaskSLA] Fatal error:", err);
  process.exit(1);
});
