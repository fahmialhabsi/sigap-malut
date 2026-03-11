#!/usr/bin/env node
/**
 * scripts/checkTaskSLA.js
 *
 * Cron script: mark overdue tasks and write audit_log entries.
 * Run with:  node scripts/checkTaskSLA.js
 * Schedule:  0 * * * * (every hour) or via system cron / CI job
 */
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../backend/.env") });

import sequelize from "../backend/config/database.js";
import Task from "../backend/models/Task.js";
import TaskLog from "../backend/models/TaskLog.js";
import writeAuditLog from "../backend/utils/auditLogger.js";
import { Op } from "sequelize";

const SYSTEM_ACTOR_ID = 0; // System/cron actor

async function checkSLA() {
  console.log(`[checkTaskSLA] Starting SLA check at ${new Date().toISOString()}`);

  try {
    await sequelize.authenticate();

    // Sync models so tables exist
    await sequelize.sync();

    const now = new Date();

    // Find tasks that are overdue (due_date in past, not yet closed/verified)
    const overdueTasks = await Task.findAll({
      where: {
        due_date: { [Op.lt]: now },
        status: { [Op.notIn]: ["verified", "closed"] },
      },
    });

    console.log(`[checkTaskSLA] Found ${overdueTasks.length} overdue task(s)`);

    for (const task of overdueTasks) {
      const oldData = task.toJSON();

      // Log the overdue status (don't force-close; just audit)
      await TaskLog.create({
        task_id: task.id,
        actor_id: SYSTEM_ACTOR_ID,
        action: "SLA_OVERDUE",
        note: `Tugas melewati batas waktu (due: ${task.due_date?.toISOString()}, now: ${now.toISOString()})`,
        data_old: oldData,
        data_new: oldData,
      });

      await writeAuditLog({
        modul: "tasks",
        entitasId: task.id,
        aksi: "SLA_OVERDUE",
        dataLama: oldData,
        dataBaru: oldData,
        pegawaiId: String(SYSTEM_ACTOR_ID),
      });

      console.log(`[checkTaskSLA] Marked task #${task.id} "${task.title}" as overdue`);
    }

    console.log(`[checkTaskSLA] Done. Processed ${overdueTasks.length} task(s)`);
  } catch (err) {
    console.error("[checkTaskSLA] Error:", err.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

checkSLA();
