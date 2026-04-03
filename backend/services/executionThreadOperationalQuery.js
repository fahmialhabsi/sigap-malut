import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";
import { QueryTypes } from "sequelize";
import sequelize from "../config/database.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TABLES_JSON = path.join(__dirname, "../config/operationalThreadTables.json");
const TABLES = JSON.parse(readFileSync(TABLES_JSON, "utf8"));

/**
 * Baris operasional (BDS/BKT/BKS) yang terikat thread — untuk timeline & health.
 */
export async function fetchOperationalRowsForThread(threadId) {
  const tid = String(threadId || "");
  if (!tid) return [];

  const dialect = sequelize.getDialect();
  if (dialect !== "postgres") {
    return [];
  }

  const parts = [];
  for (const row of TABLES) {
    const table = row.table;
    const uk =
      typeof row.unit_kerja_sql === "string" && row.unit_kerja_sql.trim()
        ? row.unit_kerja_sql.trim()
        : "unit_kerja::text AS unit_kerja";
    parts.push(
      `(SELECT id, created_at, updated_at, COALESCE(status::text, '') AS status, task_id, execution_thread_id, '${table}' AS src_table, ${uk} FROM ${table} WHERE execution_thread_id = :tid)`,
    );
  }
  if (!parts.length) return [];

  const sql = parts.join(" UNION ALL ");
  return sequelize.query(sql, {
    replacements: { tid },
    type: QueryTypes.SELECT,
  });
}

export function getOperationalTableList() {
  return TABLES;
}
