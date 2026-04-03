import cron from "node-cron";
import { runInstruksiReminders } from "./instruksiReminderService.js";

let job = null;

/**
 * Jadwal pengingat instruksi (07:00 server time setiap hari).
 * Nonaktifkan dengan INSTRUKSI_REMINDER_DISABLED=1
 */
export function initInstruksiReminderScheduler() {
  if (process.env.INSTRUKSI_REMINDER_DISABLED === "1") {
    console.log("[InstruksiReminder] Dinonaktifkan (INSTRUKSI_REMINDER_DISABLED=1)");
    return;
  }
  if (job) return;
  job = cron.schedule(
    "0 7 * * *",
    () => {
      runInstruksiReminders().catch((e) =>
        console.error("[InstruksiReminder]", e?.message || e),
      );
    },
    { timezone: process.env.TZ || "Asia/Jayapura" },
  );
  console.log("[InstruksiReminder] Cron harian 07:00 aktif");
}
