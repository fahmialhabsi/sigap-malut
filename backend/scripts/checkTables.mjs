import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../database/database.sqlite');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

const tables = ['kpi_tracking','dynamic_modules','tata_naskah_templates','peraturan','users','audit_log','system_config','backups'];

function check(t) {
  return new Promise((resolve) => {
    db.get("SELECT COUNT(*) as c FROM sqlite_master WHERE type='table' AND name=?", [t], (err, row) => {
      if (err) resolve({table: t, error: err.message});
      else resolve({table: t, exists: row.c > 0});
    });
  });
}

(async ()=>{
  for (const t of tables) {
    const r = await check(t);
    console.log(r.table + ': ' + (r.exists ? 'exists' : 'missing') + (r.error ? ' - ' + r.error : ''));
  }
  db.close();
})();
