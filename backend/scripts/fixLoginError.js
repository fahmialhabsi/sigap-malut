#!/usr/bin/env node
// Fix script: Add missing "code" column to roles table
import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "..", "database", "database.sqlite");
const db = new (sqlite3.verbose().Database)(dbPath, (err) => {
  if (err) {
    console.error("❌ Failed to connect to database:", err.message);
    process.exit(1);
  }
  console.log("✓ Connected to SQLite database at:", dbPath);
});

db.serialize(() => {
  // Check if code column exists
  db.all("PRAGMA table_info(roles)", (err, rows) => {
    if (err) {
      console.error("❌ Failed to check table:", err.message);
      db.close();
      process.exit(1);
    }

    const hasCodeColumn = rows.some((row) => row.name === "code");
    console.log("\nRoles table columns:");
    rows.forEach((row) => console.log(`  - ${row.name} (${row.type})`));

    if (!hasCodeColumn) {
      console.log('\n⚠️  Column "code" not found. Adding...');
      db.run("ALTER TABLE roles ADD COLUMN code VARCHAR(100) UNIQUE", (err) => {
        if (err) {
          console.error("❌ Failed to add column:", err.message);
          db.close();
          process.exit(1);
        }
        console.log('✓ Column "code" added successfully');

        // Update default roles with codes
        const updates = [
          { name: "Kepala Dinas", code: "kepala_dinas" },
          { name: "Sekretaris", code: "sekretaris" },
          {
            name: "Kepala Bidang Ketersediaan",
            code: "kepala_bidang_ketersediaan",
          },
          {
            name: "Kepala Bidang Distribusi",
            code: "kepala_bidang_distribusi",
          },
          { name: "Kepala Bidang Konsumsi", code: "kepala_bidang_konsumsi" },
          { name: "Kepala UPTD", code: "kepala_uptd" },
          { name: "Super Admin", code: "super_admin" },
        ];

        let updated = 0;
        const updateNext = () => {
          if (updated >= updates.length) {
            console.log(`✓ Updated ${updated} roles with codes`);
            db.close();
            console.log(
              "\n✅ Migration complete! Restart backend to test login.\n",
            );
            process.exit(0);
            return;
          }

          const { name, code } = updates[updated];
          db.run(
            "UPDATE roles SET code = ? WHERE name = ? AND code IS NULL",
            [code, name],
            (err) => {
              if (err) {
                console.warn(`⚠️  Failed to update ${name}:`, err.message);
              } else {
                console.log(`  ✓ ${name} → ${code}`);
              }
              updated++;
              updateNext();
            },
          );
        };

        console.log("\nUpdating role codes:");
        updateNext();
      });
    } else {
      console.log('\n✓ Column "code" already exists - no migration needed\n');
      db.close();
      process.exit(0);
    }
  });
});
