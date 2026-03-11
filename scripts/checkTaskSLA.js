// Simple script to mark overdue tasks (run via cron)
/* eslint-disable no-console */
const { Task, sequelize } = require("../backend/models"); // adjust path if needed

async function run() {
  try {
    const now = new Date();
    const overdue = await Task.findAll({
      where: {
        status: "assigned",
        due_date: { [sequelize.Op.lt]: now },
      },
    });
    for (const t of overdue) {
      // mark as submitted? or flagged - for MVP we add a TaskLog
      await sequelize.models.TaskLog.create({
        task_id: t.id,
        actor_id: null,
        action: "SLA_OVERDUE",
        note: "Task overdue detected by SLA checker",
        created_at: new Date(),
      });
      console.log("Overdue task:", t.id, t.title);
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();
