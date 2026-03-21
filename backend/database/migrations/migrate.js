// backend/database/migrations/migrate.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sqlite3 from "sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCHEMA_PATH = path.resolve(__dirname, "../schema");
const DB_PATH = path.resolve(__dirname, "../database.sqlite");

async function runMigrations() {
  console.log("🚀 Starting Database Migration...\n");

  // Remove old database if exists
  if (fs.existsSync(DB_PATH)) {
    console.log("🗑️  Removing old database...\n");
    fs.unlinkSync(DB_PATH);
  }

  // Create new database connection
  const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error("❌ Failed to create database:", err);
      process.exit(1);
    }
  });

  console.log("✅ Database connection established\n");

  // Read all SQL files
  const sqlFiles = fs
    .readdirSync(SCHEMA_PATH)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  console.log(`📂 Found ${sqlFiles.length} schema files\n`);

  let tablesCreated = 0;
  let indexesCreated = 0;
  let errors = 0;

  // Execute each SQL file
  for (const file of sqlFiles) {
    const filePath = path.join(SCHEMA_PATH, file);
    const sql = fs.readFileSync(filePath, "utf-8");

    await new Promise((resolve, reject) => {
      db.exec(sql, (err) => {
        if (err) {
          console.error(`  ❌ Error executing ${file}:`, err.message);
          errors++;
          resolve();
        } else {
          // Count statements
          const tableMatches = sql.match(/CREATE TABLE IF NOT EXISTS/gi);
          if (tableMatches) {
            tablesCreated += tableMatches.length;
          }

          const indexMatches = sql.match(/CREATE INDEX IF NOT EXISTS/gi);
          if (indexMatches) {
            indexesCreated += indexMatches.length;
          }

          console.log(`  ✅ Executed: ${file}`);
          resolve();
        }
      });
    });
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`✅ Migration complete!`);
  console.log(
    `📊 SQL files executed: ${sqlFiles.length - errors}/${sqlFiles.length}`,
  );
  console.log(`📊 Tables created: ${tablesCreated}`);
  console.log(`📊 Indexes created: ${indexesCreated}`);
  if (errors > 0) {
    console.log(`⚠️  Errors: ${errors}`);
  }
  console.log(`${"=".repeat(60)}\n`);

  // Verify tables
  await new Promise((resolve, reject) => {
    db.all(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;",
      [],
      (err, tables) => {
        if (err) {
          console.error("❌ Error verifying tables:", err);
          resolve();
          return;
        }

        console.log(`📋 Tables in database: ${tables.length}\n`);

        if (tables.length > 0) {
          console.log("Tables created:");
          tables.forEach((table) => {
            console.log(`  ✅ ${table.name}`);
          });
          console.log("");
        } else {
          console.log("⚠️  WARNING: No tables found in database!\n");
        }

        resolve();
      },
    );
  });

  // Close database
  db.close((err) => {
    if (err) {
      console.error("❌ Error closing database:", err);
    } else {
      console.log("✅ Database connection closed\n");
    }
  });
}

runMigrations().catch((error) => {
  console.error("❌ Migration failed:", error);
  process.exit(1);
});
