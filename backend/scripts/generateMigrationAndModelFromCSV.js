// Script generator otomatis migration & model Sequelize dari CSV fields
// ESM compatible

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse/sync";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WORKSPACE_ROOT = path.resolve(__dirname, "../../");
const FIELDS_DIRS = [
  path.join(WORKSPACE_ROOT, "master-data/FIELDS_SEKRETARIAT"),
  path.join(WORKSPACE_ROOT, "master-data/FIELDS_BIDANG_KETERSEDIAAN"),
  path.join(WORKSPACE_ROOT, "master-data/FIELDS_BIDANG_DISTRIBUSI"),
  path.join(WORKSPACE_ROOT, "master-data/FIELDS_BIDANG_KONSUMSI"),
  path.join(WORKSPACE_ROOT, "master-data/FIELDS_UPTD"),
];
const MIGRATIONS_DIR = "../migrations/auto-generated";
const MODELS_DIR = "../models/auto-generated";

function toSequelizeType(type, length) {
  switch (type) {
    case "auto_increment":
      return "DataTypes.INTEGER";
    case "int":
      return "DataTypes.INTEGER";
    case "varchar":
      return length ? `DataTypes.STRING(${length})` : "DataTypes.STRING";
    case "text":
      return "DataTypes.TEXT";
    case "boolean":
      return "DataTypes.BOOLEAN";
    case "date":
      return "DataTypes.DATEONLY";
    case "timestamp":
      return "DataTypes.DATE";
    case "decimal":
      return "DataTypes.DECIMAL";
    case "json":
      return "DataTypes.JSONB";
    case "enum":
      return "DataTypes.ENUM";
    default:
      return "DataTypes.STRING";
  }
}

function parseCSVFields(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  return parse(content, { columns: true, skip_empty_lines: true });
}

function generateModel(tableName, fields) {
  let imports =
    "import { DataTypes } from 'sequelize';\nimport sequelize from '../config/database.js';\n";
  let modelDef = `const ${tableName} = sequelize.define(\n  '${tableName}', {\n`;
  for (const field of fields) {
    let type = toSequelizeType(field.field_type, field.field_length);
    let allowNull = field.is_required === "true" ? "false" : "true";
    let unique = field.is_unique === "true" ? ", unique: true" : "";
    let autoInc =
      field.field_type === "auto_increment" ? ", autoIncrement: true" : "";
    let defVal =
      field.default_value && field.default_value !== "NULL"
        ? `, defaultValue: ${JSON.stringify(field.default_value)}`
        : "";
    let primaryKey =
      field.field_type === "auto_increment" ? ", primaryKey: true" : "";
    modelDef += `    ${field.field_name}: { type: ${type}, allowNull: ${allowNull}${unique}${autoInc}${defVal}${primaryKey} },\n`;
  }
  modelDef += `  }, { tableName: '${tableName}', timestamps: false });\n`;
  modelDef += `\nexport default ${tableName};\n`;
  return imports + modelDef;
}

function generateMigration(tableName, fields) {
  let up = `await queryInterface.createTable('${tableName}', {\n`;
  for (const field of fields) {
    let type = toSequelizeType(field.field_type, field.field_length);
    let allowNull = field.is_required === "true" ? "false" : "true";
    let unique = field.is_unique === "true" ? ", unique: true" : "";
    let autoInc =
      field.field_type === "auto_increment" ? ", autoIncrement: true" : "";
    let defVal =
      field.default_value && field.default_value !== "NULL"
        ? `, defaultValue: ${JSON.stringify(field.default_value)}`
        : "";
    let primaryKey =
      field.field_type === "auto_increment" ? ", primaryKey: true" : "";
    up += `      ${field.field_name}: { type: ${type}, allowNull: ${allowNull}${unique}${autoInc}${defVal}${primaryKey} },\n`;
  }
  up += `    });`;
  let down = `await queryInterface.dropTable('${tableName}');`;
  return `export async function up({ context: queryInterface }) {\n  ${up}\n}\n\nexport async function down({ context: queryInterface }) {\n  ${down}\n}\n`;
}

function main() {
  if (!fs.existsSync(MIGRATIONS_DIR))
    fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
  if (!fs.existsSync(MODELS_DIR)) fs.mkdirSync(MODELS_DIR, { recursive: true });
  for (const dir of FIELDS_DIRS) {
    const absDir = dir; // Use the updated FIELDS_DIRS directly
    if (!fs.existsSync(absDir)) {
      console.warn("Directory not found:", absDir);
      continue;
    }
    for (const file of fs.readdirSync(absDir)) {
      if (!file.endsWith("_fields.csv")) continue;
      const tableName = file.replace("_fields.csv", "");
      const fields = parseCSVFields(path.join(absDir, file));
      // Model
      if (!fs.existsSync(MODELS_DIR))
        fs.mkdirSync(MODELS_DIR, { recursive: true });
      const modelCode = generateModel(tableName, fields);
      fs.writeFileSync(path.join(MODELS_DIR, `${tableName}.js`), modelCode);
      // Migration
      if (!fs.existsSync(MIGRATIONS_DIR))
        fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
      const migrationCode = generateMigration(tableName, fields);
      fs.writeFileSync(
        path.join(MIGRATIONS_DIR, `migration_${tableName}.js`),
        migrationCode,
      );
      console.log(`Generated model & migration for ${tableName}`);
    }
  }
}

main();
