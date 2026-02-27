import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, "../database/database.sqlite");

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error("ERROR opening DB:", err.message);
    process.exit(1);
  }
});

function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

async function upsert() {
  try {
    // SA09 sample for current month
    const periode = new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-\d{2}$/, "-01");
    const row = await new Promise((resolve, reject) => {
      db.get(
        "SELECT id FROM compliance_tracking WHERE periode = ?",
        [periode],
        (e, r) => {
          if (e) return reject(e);
          resolve(r);
        },
      );
    });

    if (!row) {
      await runAsync(
        `INSERT INTO compliance_tracking (periode, total_transactions, bypass_count, bypass_percentage, compliance_percentage, target_compliance, status, bypass_details, top_violators, remedial_actions, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [periode, 0, 0, 0, 100, 100, "on_target", "[]", "[]", ""],
      );
      console.log("Inserted compliance_tracking sample row");
    } else {
      console.log("compliance_tracking sample already exists");
    }

    // SA10 default config
    const aiRow = await new Promise((resolve, reject) => {
      db.get("SELECT id FROM ai_config LIMIT 1", [], (e, r) => {
        if (e) return reject(e);
        resolve(r);
      });
    });

    if (!aiRow) {
      await runAsync(
        `INSERT INTO ai_config (ai_service, api_key, api_endpoint, model_name, temperature, max_tokens, features_enabled, classification_accuracy, total_requests, total_cost, monthly_budget, is_active, last_health_check, updated_by, created_at, updated_at)
        VALUES (?, NULL, NULL, ?, ?, ?, ?, NULL, ?, ?, ?, ?, NULL, NULL, datetime('now'), datetime('now'))`,
        ["openai", "gpt-4", 0.5, 1000, "[]", 0, 0, 100, 1],
      );
      console.log("Inserted ai_config default row");
    } else {
      console.log("ai_config already has a row");
    }

    db.close();
  } catch (err) {
    console.error("ERROR upsert:", err.message || err);
    db.close();
    process.exit(1);
  }
}

upsert();
