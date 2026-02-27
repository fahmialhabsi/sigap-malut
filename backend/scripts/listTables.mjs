import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, "../database/database.sqlite");

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error("ERROR opening DB:", err.message);
    process.exit(1);
  }
});

db.all(
  "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;",
  (err, rows) => {
    if (err) {
      console.error("ERROR querying sqlite_master:", err.message);
      process.exit(1);
    }
    console.log("Tables:");
    rows.forEach((r) => console.log("  " + r.name));
    db.get(
      "SELECT count(*) as c FROM sqlite_master WHERE type='table' AND name='users'",
      (e, row) => {
        if (e) {
          console.error("ERROR checking users table:", e.message);
          process.exit(1);
        }
        console.log("\nusers table exists count:", row.c);
        db.close();
      },
    );
  },
);
