import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { fileURLToPath } from "url";
import { sequelize } from "../config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MASTER_DATA_DIR = path.resolve(__dirname, "../../master-data");
const MIGRATIONS_DIR = path.resolve(__dirname, "../migrations");

const FIELD_FOLDERS = [
  "FIELDS_SEKRETARIAT",
  "FIELDS_BIDANG_KETERSEDIAAN",
  "FIELDS_BIDANG_DISTRIBUSI",
  "FIELDS_BIDANG_KONSUMSI",
  "FIELDS_UPTD",
];

function parseCsv(filePath) {
  return new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => rows.push(row))
      .on("end", () => resolve(rows))
      .on("error", reject);
  });
}

function toTableName(moduleId) {
  return String(moduleId || "")
    .trim()
    .toLowerCase()
    .replace(/-/g, "_");
}

function toColumnType(field = {}) {
  const type = String(field.field_type || "text").toLowerCase();
  const len = String(field.field_length || "").trim();

  if (type === "int" || type === "integer" || type === "auto_increment") {
    return "Sequelize.INTEGER";
  }
  if (type === "varchar") {
    return len
      ? `Sequelize.STRING(${Number.parseInt(len, 10) || 255})`
      : "Sequelize.STRING";
  }
  if (type === "text") return "Sequelize.TEXT";
  if (type === "date") return "Sequelize.DATEONLY";
  if (type === "timestamp") return "Sequelize.DATE";
  if (type === "boolean") return "Sequelize.BOOLEAN";
  if (type === "decimal") {
    if (len && /^\d+,\d+$/.test(len)) {
      const [p, s] = len.split(",");
      return `Sequelize.DECIMAL(${Number.parseInt(p, 10)}, ${Number.parseInt(s, 10)})`;
    }
    return "Sequelize.DECIMAL(12, 2)";
  }
  if (type === "json") return "Sequelize.JSON";

  // enum and unknown fallback
  return "Sequelize.STRING";
}

function shouldSkipField(fieldName) {
  const low = String(fieldName || "").toLowerCase();
  return ["id", "created_at", "updated_at", "deleted_at"].includes(low);
}

function nowMigrationStamp() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${yyyy}${mm}${dd}${hh}${mi}${ss}`;
}

function buildMigrationContent(changes) {
  const upLines = [];
  const downLines = [];

  for (const change of changes) {
    upLines.push(
      `  await queryInterface.addColumn("${change.table}", "${change.column}", { type: ${change.type}, allowNull: ${change.allowNull} }).catch(() => {});`,
    );
    downLines.push(
      `  await queryInterface.removeColumn("${change.table}", "${change.column}").catch(() => {});`,
    );
  }

  return `export const up = async (queryInterface, Sequelize) => {\n${upLines.join("\n")}\n};\n\nexport const down = async (queryInterface) => {\n${downLines.join("\n")}\n};\n`;
}

async function collectFieldDefinitions() {
  const modules = [];

  for (const folder of FIELD_FOLDERS) {
    const folderPath = path.join(MASTER_DATA_DIR, folder);
    if (!fs.existsSync(folderPath)) continue;

    const files = fs
      .readdirSync(folderPath)
      .filter((name) => name.toLowerCase().endsWith("_fields.csv"));

    for (const file of files) {
      const moduleId = file.replace(/_fields\.csv$/i, "").toUpperCase();
      const fields = await parseCsv(path.join(folderPath, file));
      modules.push({ moduleId, fields });
    }
  }

  return modules;
}

async function detectMissingColumns() {
  const queryInterface = sequelize.getQueryInterface();
  const modules = await collectFieldDefinitions();
  const missing = [];

  for (const moduleDef of modules) {
    const table = toTableName(moduleDef.moduleId);
    let description = null;

    try {
      description = await queryInterface.describeTable(table);
    } catch {
      continue;
    }

    const existingColumns = new Set(
      Object.keys(description).map((name) => String(name).toLowerCase()),
    );

    for (const field of moduleDef.fields) {
      const fieldName = String(field.field_name || "").trim();
      if (!fieldName || shouldSkipField(fieldName)) continue;

      if (!existingColumns.has(fieldName.toLowerCase())) {
        missing.push({
          table,
          column: fieldName,
          type: toColumnType(field),
          allowNull:
            String(field.is_required || "false").toLowerCase() !== "true",
        });
      }
    }
  }

  return missing;
}

async function main() {
  try {
    await sequelize.authenticate();

    const missingColumns = await detectMissingColumns();
    if (!missingColumns.length) {
      console.log("No schema mismatch detected against master-data fields.");
      process.exit(0);
    }

    if (!fs.existsSync(MIGRATIONS_DIR)) {
      fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
    }

    const migrationName = `${nowMigrationStamp()}-master-data-schema-alignment.js`;
    const target = path.join(MIGRATIONS_DIR, migrationName);
    fs.writeFileSync(target, buildMigrationContent(missingColumns), "utf8");

    console.log(
      `Generated migration: ${migrationName} (${missingColumns.length} missing columns)`,
    );
  } catch (error) {
    console.error("Failed to generate master-data migration:", error.message);
    process.exit(1);
  }
}

main();
