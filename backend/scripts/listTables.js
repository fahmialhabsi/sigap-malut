import sqlite3 from "sqlite3";

const db = new (sqlite3.verbose().Database)("./database/database.sqlite");

db.all(
  "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name",
  (err, rows) => {
    if (err) {
      console.error("❌ Error:", err.message);
    } else {
      console.log(`Found ${rows?.length || 0} tables`);
      rows?.forEach((r) => console.log(`  - ${r.name}`));
    }
    db.close();
  },
);
