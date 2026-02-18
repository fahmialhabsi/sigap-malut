import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MASTER_DATA_PATH = path.resolve(__dirname, "../../master-data");
const MODELS_OUTPUT_PATH = path.resolve(__dirname, "../models");

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

function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}

function toPascalCase(str) {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

// Map CSV type to Sequelize DataType
function mapTypeToSequelize(field) {
  switch (field.field_type) {
    case "varchar":
      return `DataTypes.STRING(${field.field_length || 255})`;
    case "int":
      return "DataTypes.INTEGER";
    case "decimal":
      return `DataTypes.DECIMAL${field.field_length ? `(${field.field_length})` : "(15, 2)"}`;
    case "boolean":
      return "DataTypes.BOOLEAN";
    case "date":
      return "DataTypes.DATEONLY";
    case "time":
      return "DataTypes.TIME";
    case "timestamp":
      return "DataTypes.DATE";
    case "text":
      return "DataTypes.TEXT";
    case "json":
      return "DataTypes.JSON";
    case "enum":
      if (field.dropdown_options) {
        const values = field.dropdown_options
          .split(",")
          .map((o) => `'${o.trim()}'`)
          .join(", ");
        return `DataTypes.ENUM(${values})`;
      }
      return "DataTypes.STRING(100)";
    default:
      return "DataTypes.STRING";
  }
}

function generateModel(modulId, fields) {
  const tableName = modulId.toLowerCase().replace(/-/g, "_");
  const modelName = toPascalCase(tableName);

  let code = `// =====================================================\n`;
  code += `// MODEL: ${modelName}\n`;
  code += `// TABLE: ${tableName}\n`;
  code += `// MODULE: ${modulId}\n`;
  code += `// Generated: ${new Date().toISOString()}\n`;
  code += `// =====================================================\n\n`;

  code += `import { DataTypes } from 'sequelize';\n`;
  code += `import sequelize from '../config/database.js';\n\n`;

  code += `const ${modelName} = sequelize.define('${modelName}', {\n`;

  const attributes = fields.map((field) => {
    // Skip auto_increment id (handled by Sequelize)
    if (field.field_name === "id" && field.field_type === "auto_increment") {
      return `  id: {\n    type: DataTypes.INTEGER,\n    primaryKey: true,\n    autoIncrement: true\n  }`;
    }

    let attr = `  ${field.field_name}: {\n`;
    attr += `    type: ${mapTypeToSequelize(field)},\n`;

    // allowNull
    if (field.is_required === "true") {
      attr += `    allowNull: false,\n`;
    }

    // unique
    if (field.is_unique === "true") {
      attr += `    unique: true,\n`;
    }

    // defaultValue
    if (field.default_value && field.default_value !== "NULL") {
      if (field.default_value === "CURRENT_TIMESTAMP") {
        attr += `    defaultValue: DataTypes.NOW,\n`;
      } else if (field.field_type === "boolean") {
        attr += `    defaultValue: ${field.default_value === "1" || field.default_value === "true" ? "true" : "false"},\n`;
      } else if (field.field_type === "int" || field.field_type === "decimal") {
        attr += `    defaultValue: ${field.default_value},\n`;
      } else {
        attr += `    defaultValue: '${field.default_value}',\n`;
      }
    }

    // comment/help_text
    if (field.help_text) {
      const escapedHelp = field.help_text
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"');
      attr += `    comment: '${escapedHelp}',\n`;
    }

    attr += `  }`;
    return attr;
  });

  code += attributes.join(",\n");

  code += `\n}, {\n`;
  code += `  tableName: '${tableName}',\n`;
  code += `  timestamps: true,\n`;
  code += `  underscored: true,\n`;
  code += `  createdAt: 'created_at',\n`;
  code += `  updatedAt: 'updated_at'\n`;
  code += `});\n\n`;

  code += `export default ${modelName};\n`;

  return code;
}

async function main() {
  console.log("🚀 Starting Model Generation from CSV...\n");
  console.log(`📂 Master Data Path: ${MASTER_DATA_PATH}\n`);

  const fieldsFolders = [
    "FIELDS_SEKRETARIAT",
    "FIELDS_BIDANG_KETERSEDIAAN",
    "FIELDS_BIDANG_DISTRIBUSI",
    "FIELDS_BIDANG_KONSUMSI",
    "FIELDS_UPTD",
  ];

  if (!fs.existsSync(MODELS_OUTPUT_PATH)) {
    fs.mkdirSync(MODELS_OUTPUT_PATH, { recursive: true });
    console.log(`✅ Created output directory: ${MODELS_OUTPUT_PATH}\n`);
  }

  let totalModels = 0;
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

    console.log(`📁 Processing ${folder} (${files.length} models)...`);

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const modulId = file.replace("_fields.csv", "").toUpperCase();

      try {
        const fields = await readCSV(filePath);

        if (fields.length === 0) {
          console.log(`  ⚠️  Skipped ${modulId} (no fields)`);
          continue;
        }

        const code = generateModel(modulId, fields);

        const outputFile = path.join(MODELS_OUTPUT_PATH, `${modulId}.js`);
        fs.writeFileSync(outputFile, code);

        console.log(`  ✅ Generated: ${modulId}.js (${fields.length} fields)`);
        totalModels++;
      } catch (error) {
        console.error(`  ❌ Error generating ${file}:`, error.message);
        errors++;
      }
    }

    console.log("");
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log(`✅ Model generation complete!`);
  console.log(`📊 Total models generated: ${totalModels}`);
  if (errors > 0) {
    console.log(`⚠️  Errors encountered: ${errors}`);
  }
  console.log(`📂 Output directory: ${MODELS_OUTPUT_PATH}`);
  console.log(`${"=".repeat(60)}\n`);
}

main().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
