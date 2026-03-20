// Script import otomatis data master dari file CSV ke PostgreSQL, per folder
// ESM compatible
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse/sync";
import pkg from "pg";

const { Client } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Konfigurasi koneksi PostgreSQL
const db = new Client({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "sigap",
  password: process.env.DB_PASSWORD || "123",
  port: parseInt(process.env.DB_PORT) || 5432,
});

const MASTER_FOLDERS = [
  path.join(__dirname, "../../master-data/FIELDS_SEKRETARIAT"),
  path.join(__dirname, "../../master-data/FIELDS_BIDANG_KETERSEDIAAN"),
  path.join(__dirname, "../../master-data/FIELDS_BIDANG_DISTRIBUSI"),
  path.join(__dirname, "../../master-data/FIELDS_BIDANG_KONSUMSI"),
  path.join(__dirname, "../../master-data/FIELDS_UPTD"),
  path.join(__dirname, "../../frontend/public/master-data/FIELDS_SEKRETARIAT"),
  path.join(
    __dirname,
    "../../frontend/public/master-data/FIELDS_BIDANG_KETERSEDIAAN",
  ),
  path.join(
    __dirname,
    "../../frontend/public/master-data/FIELDS_BIDANG_DISTRIBUSI",
  ),
  path.join(
    __dirname,
    "../../frontend/public/master-data/FIELDS_BIDANG_KONSUMSI",
  ),
  path.join(__dirname, "../../frontend/public/master-data/FIELDS_UPTD"),
  path.join(__dirname, "../../frontend/public/master-data/FIELDS"),
];

const LOG_TABLE = "data_integration_log";

async function getTableColumns(tableName) {
  // Ambil kolom tabel dari information_schema, exclude auto-increment (serial) dan default (nextval)
  const res = await db.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = $1 AND table_schema = 'public' AND (
      column_default IS NULL OR column_default NOT LIKE 'nextval%') ORDER BY ordinal_position`,
    [tableName],
  );
  return res.rows.map((r) => r.column_name);
}

async function importCsvToTable(csvPath, tableName, sourceUnit) {
  try {
    const content = fs.readFileSync(csvPath, "utf-8");
    const records = parse(content, { columns: true, skip_empty_lines: true });
    if (records.length === 0) return;

    // Ambil kolom tabel yang valid
    const validColumns = await getTableColumns(tableName);
    if (validColumns.length === 0) {
      console.error(
        `Tabel ${tableName} tidak ditemukan atau tidak ada kolom yang valid.`,
      );
      return;
    }

    // Mulai transaction
    await db.query("BEGIN");

    try {
      for (const rec of records) {
        // Hanya ambil kolom yang cocok
        const filtered = {};
        for (const col of validColumns) {
          if (rec.hasOwnProperty(col))
            filtered[col] = rec[col] === "NULL" ? null : rec[col];
        }
        const columns = Object.keys(filtered);
        if (columns.length === 0) continue;
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(",");
        const values = columns.map((col) => filtered[col]);
        // Tambahkan ON CONFLICT DO NOTHING untuk deduplication
        const query = `INSERT INTO ${tableName} (${columns.join(",")}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;
        try {
          await db.query(query, values);
          await db.query(
            `INSERT INTO ${LOG_TABLE} (source_unit, source_table, source_record_id, destination_table, integration_type, status, integrated_by, data_snapshot) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
            [
              sourceUnit,
              tableName,
              null,
              tableName,
              "import",
              "success",
              "import-script",
              JSON.stringify(filtered),
            ],
          );
        } catch (err) {
          await db.query(
            `INSERT INTO ${LOG_TABLE} (source_unit, source_table, source_record_id, destination_table, integration_type, status, integrated_by, data_snapshot, error_message) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
            [
              sourceUnit,
              tableName,
              null,
              tableName,
              "import",
              "error",
              "import-script",
              JSON.stringify(filtered),
              err.message,
            ],
          );
        }
      }
      // Commit transaction jika semua berhasil
      await db.query("COMMIT");
      console.log(`Imported ${records.length} rows to ${tableName}`);
    } catch (e) {
      // Rollback jika ada error
      await db.query("ROLLBACK");
      throw e;
    }
  } catch (e) {
    console.error(`Gagal import ${csvPath}:`, e.message);
  }
}

async function main() {
  await db.connect();
  for (const folder of MASTER_FOLDERS) {
    if (!fs.existsSync(folder)) continue;
    const files = fs
      .readdirSync(folder)
      .filter((f) => f.endsWith(".csv") && !f.endsWith("_fields.csv"));
    const sourceUnit = path.basename(folder);
    for (const file of files) {
      const tableName = file
        .replace(".csv", "")
        .replace(/-/g, "_")
        .toLowerCase();
      const csvPath = path.join(folder, file);
      await importCsvToTable(csvPath, tableName, sourceUnit);
    }
  }
  await db.end();
}

main();
