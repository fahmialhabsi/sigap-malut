import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = process.env.DB_STORAGE || "backend/database/database.sqlite";
const dbPath = path.isAbsolute(storage)
  ? storage
  : path.resolve(
      process.cwd(),
      storage.startsWith("backend/")
        ? storage
        : path.resolve(__dirname, "..", storage),
    );

console.log("Using DB file:", dbPath);

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error("Failed to open DB:", err.message);
    process.exit(2);
  }

  db.get("SELECT COUNT(*) as c FROM compliance_tracking", (e1, r1) => {
    if (e1) console.error("compliance_tracking error:", e1.message);
    else console.log("compliance_tracking count:", r1.c);

    db.get("SELECT COUNT(*) as c FROM ai_config", (e2, r2) => {
      if (e2) console.error("ai_config error:", e2.message);
      else console.log("ai_config count:", r2.c);
      db.close();
    });
  });
});
