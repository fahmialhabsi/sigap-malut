import sqlite3 from "sqlite3";

const db = new sqlite3.Database("./database/database.sqlite");

db.all(
  "SELECT id, name, code, level, is_active FROM roles ORDER BY level",
  [],
  (err, rows) => {
    if (err) {
      console.error("Error querying roles:", err.message);
      db.close();
      process.exit(1);
    }

    console.log("\n✅ Roles created successfully:\n");
    if (rows && rows.length > 0) {
      rows.forEach((role) => {
        console.log(`  [Level ${role.level}] ${role.name}`);
        console.log(`    Code: ${role.code}, Active: ${role.is_active}`);
      });
      console.log(`\n📊 Total: ${rows.length} roles\n`);
    } else {
      console.log("  (No roles found)\n");
    }

    db.close();
  },
);
