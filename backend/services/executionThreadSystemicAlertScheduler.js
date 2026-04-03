import cron from "node-cron";
import { runSystemicThreadAlertsScan } from "./executionThreadSystemicAlertService.js";

let job = null;

/**
 * Pindai alert sistemik (thread kritis) — default 6 jam. Nonaktif: SYSTEMIC_THREAD_ALERT_DISABLED=1
 */
export function initSystemicThreadAlertScheduler() {
  if (process.env.SYSTEMIC_THREAD_ALERT_DISABLED === "1") {
    console.log("[SystemicThreadAlert] Dinonaktifkan (SYSTEMIC_THREAD_ALERT_DISABLED=1)");
    return;
  }
  if (job) return;
  const expr = process.env.SYSTEMIC_THREAD_ALERT_CRON || "0 */6 * * *";
  job = cron.schedule(
    expr,
    () => {
      runSystemicThreadAlertsScan().catch((e) =>
        console.error("[SystemicThreadAlert]", e?.message || e),
      );
    },
    { timezone: process.env.TZ || "Asia/Jayapura" },
  );
  console.log("[SystemicThreadAlert] Cron aktif:", expr);
}
