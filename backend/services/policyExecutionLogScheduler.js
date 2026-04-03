import cron from "node-cron";
import { runPolicyExecutionLogJob } from "./policyExecutionPersistService.js";

let job = null;

/**
 * Job terpisah: persist evaluasi policy ke execution_thread_events (bukan di GET).
 * Nonaktif: POLICY_EXECUTION_LOG_DISABLED=1
 */
export function initPolicyExecutionLogScheduler() {
  if (process.env.POLICY_EXECUTION_LOG_DISABLED === "1") {
    console.log("[PolicyExecutionLog] Dinonaktifkan (POLICY_EXECUTION_LOG_DISABLED=1)");
    return;
  }
  if (job) return;
  const expr = process.env.POLICY_EXECUTION_LOG_CRON || "15 */4 * * *";
  job = cron.schedule(
    expr,
    () => {
      runPolicyExecutionLogJob()
        .then((r) =>
          console.log(
            "[PolicyExecutionLog] selesai — thread:",
            r.threads_scanned,
            "event baru:",
            r.events_written,
            "error:",
            r.errors?.length || 0,
          ),
        )
        .catch((e) => console.error("[PolicyExecutionLog]", e?.message || e));
    },
    { timezone: process.env.TZ || "Asia/Jayapura" },
  );
  console.log("[PolicyExecutionLog] Cron aktif:", expr, "| dedupe jam:", process.env.POLICY_LOG_DEDUPE_HOURS || 6);
}
