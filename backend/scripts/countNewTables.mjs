import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, "../database/database.sqlite");
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

const tables = [
  "kpi_tracking",
  "dynamic_modules",
  "tata_naskah_templates",
  "peraturan",
  "audit_log",
  "system_config",
  "backups",
  "compliance_tracking",
  "ai_config",
];

function getCount(t) {
  return new Promise((res, rej) => {
    db.get(`SELECT COUNT(*) as c FROM ${t}`, (err, row) => {
      if (err) return res({ table: t, error: err.message });
      res({ table: t, count: row.c });
    });
  });
}

(async () => {
  for (const t of tables) {
    const r = await getCount(t);
    if (r.error) console.log(`${r.table}: ERROR: ${r.error}`);
    else console.log(`${r.table}: ${r.count}`);
  }
  db.close();
})();
