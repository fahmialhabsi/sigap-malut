import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MASTER_DATA_PATH = path.resolve(__dirname, "../../master-data");
const SCHEMA_OUTPUT_PATH = path.resolve(__dirname, "../database/schema");

// Fungsi untuk baca CSV
function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error));
  });
}

// Mapping type CSV ke SQL
function mapTypeToSQL(field) {
  switch (field.field_type) {
    case "auto_increment":
      return "INTEGER PRIMARY KEY AUTOINCREMENT";
    case "varchar":
      return `VARCHAR(${field.field_length || 255})`;
    case "int":
      return "INTEGER";
    case "decimal":
      return `DECIMAL${field.field_length ? `(${field.field_length})` : "(15,2)"}`;
    case "boolean":
      return "BOOLEAN";
    case "date":
      return "DATE";
    case "time":
      return "TIME";
    case "timestamp":
      return "TIMESTAMP";
    case "text":
      return "TEXT";
    case "json":
      return "JSON";
    case "enum":
      if (field.dropdown_options) {
        const options = field.dropdown_options
          .split(",")
          .map((o) => `'${o.trim()}'`)
          .join(", ");
        return `VARCHAR(100) CHECK(${field.field_name} IN (${options}))`;
      }
      return "VARCHAR(100)";
    default:
      return "VARCHAR(255)";
  }
}

// Generate SQL dari fields
function generateSQL(modulId, fields) {
  const tableName = modulId.toLowerCase().replace(/-/g, "_");

  let sql = `-- =====================================================\n`;
  sql += `-- TABLE: ${tableName}\n`;
  sql += `-- MODULE: ${modulId}\n`;
  sql += `-- Generated: ${new Date().toISOString()}\n`;
  sql += `-- =====================================================\n\n`;

  sql += `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;

  const columns = fields.map((field) => {
    let columnDef = `  ${field.field_name} ${mapTypeToSQL(field)}`;

    // NOT NULL constraint
    if (field.is_required === "true" && field.field_type !== "auto_increment") {
      columnDef += " NOT NULL";
    }

    // UNIQUE constraint
    if (field.is_unique === "true") {
      columnDef += " UNIQUE";
    }

    // DEFAULT value
    if (field.default_value && field.default_value !== "NULL") {
      if (field.default_value === "CURRENT_TIMESTAMP") {
        columnDef += " DEFAULT CURRENT_TIMESTAMP";
      } else if (
        field.field_type === "varchar" ||
        field.field_type === "enum" ||
        field.field_type === "text"
      ) {
        columnDef += ` DEFAULT '${field.default_value}'`;
      } else {
        columnDef += ` DEFAULT ${field.default_value}`;
      }
    }

    return columnDef;
  });

  sql += columns.join(",\n");
  sql += "\n);\n\n";

  // Create indexes for common fields
  const indexableFields = fields.filter(
    (f) =>
      (f.field_name.endsWith("_id") && f.field_name !== "id") ||
      f.field_name === "status" ||
      f.field_name === "created_at" ||
      f.field_name === "unit_kerja" ||
      f.field_name === "layanan_id",
  );

  indexableFields.forEach((field) => {
    sql += `CREATE INDEX IF NOT EXISTS idx_${tableName}_${field.field_name} ON ${tableName}(${field.field_name});\n`;
  });

  if (indexableFields.length > 0) {
    sql += "\n";
  }

  return sql;
}

// Main execution
async function main() {
  console.log("🚀 Starting Schema Generation from CSV...\n");
  console.log(`📂 Master Data Path: ${MASTER_DATA_PATH}\n`);

  // Baca semua folder FIELDS_*
  const fieldsFolders = [
    "FIELDS_SEKRETARIAT",
    "FIELDS_BIDANG_KETERSEDIAAN",
    "FIELDS_BIDANG_DISTRIBUSI",
    "FIELDS_BIDANG_KONSUMSI",
    "FIELDS_UPTD",
  ];

  // Create output directory
  if (!fs.existsSync(SCHEMA_OUTPUT_PATH)) {
    fs.mkdirSync(SCHEMA_OUTPUT_PATH, { recursive: true });
    console.log(`✅ Created output directory: ${SCHEMA_OUTPUT_PATH}\n`);
  }

  let totalTables = 0;
  let errors = 0;

  for (const folder of fieldsFolders) {
    const folderPath = path.join(MASTER_DATA_PATH, folder);

    if (!fs.existsSync(folderPath)) {
      console.log(`⚠️  Folder not found: ${folder}`);
      continue;
    }

    const files = fs
      .readdirSync(folderPath)
      .filter((f) => f.endsWith("_fields.csv"));

    console.log(`📁 Processing ${folder} (${files.length} tables)...`);

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const modulId = file.replace("_fields.csv", "").toUpperCase();

      try {
        const fields = await readCSV(filePath);

        if (fields.length === 0) {
          console.log(`  ⚠️  Skipped ${modulId} (no fields)`);
          continue;
        }

        const sql = generateSQL(modulId, fields);

        const outputFile = path.join(
          SCHEMA_OUTPUT_PATH,
          `${modulId.toLowerCase()}.sql`,
        );
        fs.writeFileSync(outputFile, sql);

        console.log(
          `  ✅ Generated: ${modulId.toLowerCase()}.sql (${fields.length} fields)`,
        );
        totalTables++;
      } catch (error) {
        console.error(`  ❌ Error generating ${file}:`, error.message);
        errors++;
      }
    }

    console.log("");
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`✅ Schema generation complete!`);
  console.log(`📊 Total tables generated: ${totalTables}`);
  if (errors > 0) {
    console.log(`⚠️  Errors encountered: ${errors}`);
  }
  console.log(`📂 Output directory: ${SCHEMA_OUTPUT_PATH}`);
  console.log(`${"=".repeat(60)}\n`);
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
