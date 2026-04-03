import cron from "node-cron";
import { runExecutiveEscalation } from "./executiveEscalationService.js";
import { processNotificationOutboxBatch } from "./notificationOutboxService.js";

let jobEsc = null;
let jobOutbox = null;

export function initExecutiveEnterpriseScheduler() {
  if (process.env.EXECUTIVE_ENTERPRISE_CRON_DISABLED === "1") return;

  if (!jobEsc) {
    jobEsc = cron.schedule(
      "12 * * * *",
      () => {
        runExecutiveEscalation().catch((e) =>
          console.error("[ExecutiveEscalation]", e?.message || e),
        );
      },
      { timezone: process.env.TZ || "Asia/Jayapura" },
    );
  }

  if (!jobOutbox) {
    jobOutbox = cron.schedule(
      "*/2 * * * *",
      () => {
        processNotificationOutboxBatch(80).catch((e) =>
          console.error("[NotificationOutbox]", e?.message || e),
        );
      },
      { timezone: process.env.TZ || "Asia/Jayapura" },
    );
  }
}
