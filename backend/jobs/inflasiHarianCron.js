import cron from "node-cron";
import { computeAndPersistInflasiHarian } from "../services/inflasiLaspeyresService.js";

function tanggalKemarinWib() {
  const now = new Date();
  const wib = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  wib.setDate(wib.getDate() - 1);
  const y = wib.getFullYear();
  const m = String(wib.getMonth() + 1).padStart(2, "0");
  const d = String(wib.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Cron harian: hitung inflasi untuk hari kalender kemarin (WIB).
 * Default jam 00:15 WIB agar data verifikasi EOD terkumpul.
 * Override: env INFLASI_CRON_EXPRESSION (format node-cron).
 */
export function initInflasiHarianCron(logger = console) {
  const disabled = process.env.INFLASI_CRON_DISABLED === "1";
  if (disabled) {
    logger.log?.("[inflasi-cron] Dinonaktifkan (INFLASI_CRON_DISABLED=1)");
    return null;
  }

  const expr = process.env.INFLASI_CRON_EXPRESSION || "15 0 * * *";

  const task = cron.schedule(
    expr,
    async () => {
      const tanggal = tanggalKemarinWib();
      try {
        const out = await computeAndPersistInflasiHarian(tanggal);
        logger.log?.("[inflasi-cron]", tanggal, out.skipped ? out.reason : `indeks=${out.indeks_laspeyres}`);
      } catch (e) {
        logger.error?.("[inflasi-cron] gagal:", e.message);
      }
    },
    { timezone: process.env.INFLASI_CRON_TZ || "Asia/Jakarta" },
  );

  logger.log?.(`[inflasi-cron] Terjadwal: "${expr}" (${process.env.INFLASI_CRON_TZ || "Asia/Jakarta"})`);
  return task;
}
