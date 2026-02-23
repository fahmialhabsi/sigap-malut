// =====================================================
// DYNAMIC TABLE ROUTES
// Handles generic CRUD operations for all tables
// =====================================================

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import csv from "csv-parser";
import { QueryTypes } from "sequelize";
import { sequelize } from "../config/database.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCHEMA_PATH = path.resolve(__dirname, "../database/schema");
const MASTER_DATA_PATH = path.resolve(__dirname, "../../master-data");
const MODULES_CSV_PATH = path.join(
  MASTER_DATA_PATH,
  "00_MASTER_MODUL_CONFIG.csv",
);

const TABLE_ALIASES = {
  komoditas: "master_komoditas",
  kabupaten: "master_kabupaten",
};

const FIELD_TEMPLATE_BY_CATEGORY = {
  "Administrasi Umum": "FIELDS_SEKRETARIAT/SEK-ADM_fields.csv",
  Kepegawaian: "FIELDS_SEKRETARIAT/SEK-KEP_fields.csv",
  Keuangan: "FIELDS_SEKRETARIAT/SEK-KEU_fields.csv",
  Aset: "FIELDS_SEKRETARIAT/SEK-AST_fields.csv",
  Perencanaan: "FIELDS_SEKRETARIAT/SEK-REN_fields.csv",
  Ketersediaan: "FIELDS_BIDANG_KETERSEDIAAN/BKT-PGD_fields.csv",
  Kerawanan: "FIELDS_BIDANG_KETERSEDIAAN/BKT-KRW_fields.csv",
  Distribusi: "FIELDS_BIDANG_DISTRIBUSI/BDS-HRG_fields.csv",
  Cadangan: "FIELDS_BIDANG_DISTRIBUSI/BDS-CPD_fields.csv",
  Konsumsi: "FIELDS_BIDANG_KONSUMSI/BKS-DVR_fields.csv",
  Keamanan: "FIELDS_BIDANG_KONSUMSI/BKS-KMN_fields.csv",
  Sertifikasi: "FIELDS_UPTD/UPT-MTU_fields.csv",
  Audit: "FIELDS_UPTD/UPT-INS_fields.csv",
  Pengawasan: "FIELDS_UPTD/UPT-INS_fields.csv",
  Registrasi: "FIELDS_UPTD/UPT-TKN_fields.csv",
  Lab: "FIELDS_UPTD/UPT-TKN_fields.csv",
};

const FIELD_TEMPLATE_BY_BIDANG = {
  Sekretariat: "FIELDS_SEKRETARIAT/SEK-ADM_fields.csv",
  "Bidang Ketersediaan": "FIELDS_BIDANG_KETERSEDIAAN/BKT-PGD_fields.csv",
  "Bidang Distribusi": "FIELDS_BIDANG_DISTRIBUSI/BDS-HRG_fields.csv",
  "Bidang Konsumsi": "FIELDS_BIDANG_KONSUMSI/BKS-KMN_fields.csv",
  UPTD: "FIELDS_UPTD/UPT-ADM_fields.csv",
};

let cachedModules = null;
const cachedFieldTemplates = new Map();

const SAFE_COLUMN_NAME_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;

const getTableCandidates = (tableName) => {
  const normalized = String(tableName || "").toLowerCase();
  const alias = TABLE_ALIASES[tableName] || TABLE_ALIASES[normalized] || null;
  const aliasNormalized = alias ? alias.toLowerCase() : null;

  if (aliasNormalized && aliasNormalized !== normalized) {
    return [normalized, aliasNormalized];
  }

  return [normalized];
};

const getModelByName = (tableName) => {
  const direct = sequelize.models[tableName];
  if (direct) return direct;

  const normalized = tableName.toLowerCase();
  const modelKey = Object.keys(sequelize.models).find(
    (key) => key.toLowerCase() === normalized,
  );

  return modelKey ? sequelize.models[modelKey] : null;
};

const getModelByTableName = (tableName) => {
  const candidates = getTableCandidates(tableName);

  return (
    Object.values(sequelize.models).find((model) => {
      let table =
        typeof model.getTableName === "function"
          ? model.getTableName()
          : model.tableName || model.options?.tableName;

      if (!table) return false;
      if (typeof table === "object" && table.tableName) {
        table = table.tableName;
      }

      return candidates.includes(String(table).toLowerCase());
    }) || null
  );
};

const resolveTableInDatabase = async (tableName) => {
  const candidates = getTableCandidates(tableName);
  const tables = await sequelize.getQueryInterface().showAllTables();

  const tableNames = tables
    .map((table) => {
      if (typeof table === "string") return table;
      return table?.tableName || table?.name || "";
    })
    .filter(Boolean)
    .map((table) => table.toLowerCase());

  const resolved = tableNames.find((table) => candidates.includes(table));

  return resolved || null;
};

const loadSchemaSql = (tableName) => {
  const candidates = getTableCandidates(tableName);

  for (const candidate of candidates) {
    const schemaFile = path.join(SCHEMA_PATH, `${candidate}.sql`);
    if (fs.existsSync(schemaFile)) {
      return fs.readFileSync(schemaFile, "utf-8");
    }
  }

  return null;
};

const readCsv = (filePath) =>
  new Promise((resolve, reject) => {
    const rows = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => rows.push(row))
      .on("end", () => resolve(rows))
      .on("error", reject);
  });

const loadModulesConfig = async () => {
  if (cachedModules) return cachedModules;

  const rows = await readCsv(MODULES_CSV_PATH);
  cachedModules = rows
    .filter((row) => String(row.is_active || "").toLowerCase() === "true")
    .map((row) => ({
      modul_id: row.modul_id,
      kategori: row.kategori,
      bidang: row.bidang,
      tabel_name: String(row.tabel_name || "").toLowerCase(),
    }));

  return cachedModules;
};

const resolveFieldTemplatePath = (moduleRow) => {
  if (!moduleRow) return null;

  if (
    String(moduleRow.modul_id || "")
      .toUpperCase()
      .startsWith("SA")
  ) {
    const filePath = path.join(
      MASTER_DATA_PATH,
      "FIELDS",
      `${moduleRow.modul_id.toUpperCase()}_fields.csv`,
    );
    return fs.existsSync(filePath) ? filePath : null;
  }

  const byCategory = FIELD_TEMPLATE_BY_CATEGORY[moduleRow.kategori];
  if (byCategory) {
    const filePath = path.join(MASTER_DATA_PATH, byCategory);
    if (fs.existsSync(filePath)) return filePath;
  }

  const byBidang = FIELD_TEMPLATE_BY_BIDANG[moduleRow.bidang];
  if (byBidang) {
    const filePath = path.join(MASTER_DATA_PATH, byBidang);
    if (fs.existsSync(filePath)) return filePath;
  }

  return null;
};

const loadFieldTemplate = async (templatePath) => {
  if (!templatePath) return [];
  if (cachedFieldTemplates.has(templatePath)) {
    return cachedFieldTemplates.get(templatePath);
  }

  const fields = await readCsv(templatePath);
  cachedFieldTemplates.set(templatePath, fields);
  return fields;
};

const sqliteTypeFromField = (fieldType, fieldLength) => {
  const type = String(fieldType || "").toLowerCase();

  if (type === "auto_increment") return "INTEGER";
  if (type === "int" || type === "integer") return "INTEGER";
  if (type === "boolean") return "INTEGER";
  if (type === "date") return "DATE";
  if (type === "timestamp") return "TIMESTAMP";
  if (type === "json") return "TEXT";
  if (type === "text") return "TEXT";
  if (type === "enum") return "TEXT";
  if (type === "decimal")
    return fieldLength ? `DECIMAL(${fieldLength})` : "DECIMAL(12,2)";
  if (type === "varchar")
    return fieldLength ? `VARCHAR(${fieldLength})` : "VARCHAR(255)";

  return "TEXT";
};

const buildColumnDefinition = (field) => {
  const name = String(field.field_name || "").trim();
  const type = String(field.field_type || "").trim();

  if (!name || !type) return null;
  if (name === "id" || type.toLowerCase() === "auto_increment") {
    return `"id" INTEGER PRIMARY KEY AUTOINCREMENT`;
  }

  const sqlType = sqliteTypeFromField(type, field.field_length);
  const constraints = [];
  const isRequired = String(field.is_required || "").toLowerCase() === "true";
  const isUnique = String(field.is_unique || "").toLowerCase() === "true";

  if (isRequired) constraints.push("NOT NULL");
  if (isUnique) constraints.push("UNIQUE");

  const rawDefault = String(field.default_value || "").trim();
  if (rawDefault && rawDefault.toLowerCase() !== "null") {
    if (rawDefault.toUpperCase() === "CURRENT_TIMESTAMP") {
      constraints.push("DEFAULT CURRENT_TIMESTAMP");
    } else if (/^-?\d+(\.\d+)?$/.test(rawDefault)) {
      constraints.push(`DEFAULT ${rawDefault}`);
    } else {
      constraints.push(`DEFAULT '${rawDefault.replace(/'/g, "''")}'`);
    }
  }

  return `"${name}" ${sqlType}${constraints.length ? ` ${constraints.join(" ")}` : ""}`;
};

const buildAlterColumnDefinition = (field) => {
  const name = String(field.field_name || "").trim();
  const type = String(field.field_type || "").trim();

  if (
    !name ||
    !type ||
    name === "id" ||
    type.toLowerCase() === "auto_increment"
  ) {
    return null;
  }

  const sqlType = sqliteTypeFromField(type, field.field_length);
  const rawDefault = String(field.default_value || "").trim();
  let defaultClause = "";

  if (rawDefault && rawDefault.toLowerCase() !== "null") {
    if (rawDefault.toUpperCase() === "CURRENT_TIMESTAMP") {
      defaultClause = " DEFAULT CURRENT_TIMESTAMP";
    } else if (/^-?\d+(\.\d+)?$/.test(rawDefault)) {
      defaultClause = ` DEFAULT ${rawDefault}`;
    } else {
      defaultClause = ` DEFAULT '${rawDefault.replace(/'/g, "''")}'`;
    }
  }

  return `"${name}" ${sqlType}${defaultClause}`;
};

const createTableFromMasterData = async (tableName) => {
  const modules = await loadModulesConfig();
  const moduleRow = modules.find(
    (row) => row.tabel_name === String(tableName).toLowerCase(),
  );
  if (!moduleRow) return false;

  const templatePath = resolveFieldTemplatePath(moduleRow);
  const fields = await loadFieldTemplate(templatePath);
  if (!fields.length) return false;

  const columnDefs = fields.map(buildColumnDefinition).filter(Boolean);

  if (
    !columnDefs.some((definition) =>
      definition.includes('"id" INTEGER PRIMARY KEY AUTOINCREMENT'),
    )
  ) {
    columnDefs.unshift('"id" INTEGER PRIMARY KEY AUTOINCREMENT');
  }

  const createTableSql = `CREATE TABLE IF NOT EXISTS "${tableName}" (${columnDefs.join(", ")})`;
  await sequelize.query(createTableSql);

  return true;
};

const ensureTableColumnsFromMasterData = async (tableName) => {
  const modules = await loadModulesConfig();
  const moduleRow = modules.find(
    (row) => row.tabel_name === String(tableName).toLowerCase(),
  );
  if (!moduleRow) return;

  const templatePath = resolveFieldTemplatePath(moduleRow);
  const fields = await loadFieldTemplate(templatePath);
  if (!fields.length) return;

  const queryInterface = sequelize.getQueryInterface();
  const description = await queryInterface.describeTable(tableName);
  const existingColumns = new Set(
    Object.keys(description).map((name) => name.toLowerCase()),
  );

  for (const field of fields) {
    const columnName = String(field.field_name || "").trim();
    if (!columnName || existingColumns.has(columnName.toLowerCase())) continue;

    const alterDefinition = buildAlterColumnDefinition(field);
    if (!alterDefinition) continue;

    await sequelize.query(
      `ALTER TABLE "${tableName}" ADD COLUMN ${alterDefinition}`,
    );
  }
};

const splitSchemaStatements = (schemaSql) => {
  const sqlWithoutComments = schemaSql
    .split("\n")
    .map((line) => line.replace(/--.*$/, ""))
    .join("\n");

  return sqlWithoutComments
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);
};

const isMissingTableError = (error) => {
  const message = String(
    error?.original?.message || error?.parent?.message || error?.message || "",
  ).toLowerCase();

  return message.includes("no such table");
};

const sanitizePayloadColumns = (payload) =>
  Object.entries(payload || {}).filter(
    ([column]) =>
      SAFE_COLUMN_NAME_REGEX.test(column) &&
      !["id", "created_at", "updated_at", "deleted_at"].includes(
        String(column).toLowerCase(),
      ),
  );

const executeSchemaSql = async (schemaSql, tableName) => {
  const statements = splitSchemaStatements(schemaSql);
  const createTableStatements = statements.filter((statement) =>
    statement.toLowerCase().startsWith("create table"),
  );
  const otherStatements = statements.filter(
    (statement) => !statement.toLowerCase().startsWith("create table"),
  );

  for (const statement of createTableStatements) {
    await sequelize.query(statement);
  }

  let dbTable = await resolveTableInDatabase(tableName);
  if (!dbTable) {
    const created = await createTableFromMasterData(tableName);
    if (!created) {
      throw new Error(`Table '${tableName}' could not be prepared`);
    }
    dbTable = await resolveTableInDatabase(tableName);
  }

  if (!dbTable) {
    throw new Error(`Table '${tableName}' could not be prepared`);
  }

  for (const statement of otherStatements) {
    try {
      await sequelize.query(statement);
    } catch (error) {
      const isCreateIndex = statement.toLowerCase().startsWith("create index");
      if (isCreateIndex && isMissingTableError(error)) {
        continue;
      }
      throw error;
    }
  }
};

const ensureTableAvailable = async (tableName) => {
  let table = await resolveTableInDatabase(tableName);
  if (table) {
    await ensureTableColumnsFromMasterData(table);
    return table;
  }

  const schemaSql = loadSchemaSql(tableName);
  if (schemaSql) {
    await executeSchemaSql(schemaSql, tableName);
  } else {
    const created = await createTableFromMasterData(tableName);
    if (!created) return null;
  }

  table = await resolveTableInDatabase(tableName);
  if (table) {
    await ensureTableColumnsFromMasterData(table);
  }

  return table;
};

// Protect all routes

// RBAC middleware: only allow access to table if user.unit_kerja matches module's bidang/unit, except super_admin
router.use(protect);
router.use(async (req, res, next) => {
  try {
    // Super admin always allowed
    if (req.user?.role === "super_admin") return next();

    // Extract tableName from route
    const tableName = req.params.tableName || req.path.split("/")[1];
    if (!tableName)
      return res
        .status(400)
        .json({ success: false, message: "No table specified" });

    // Khusus tabel users, hanya super admin yang boleh akses
    if (String(tableName).toLowerCase() === "users") {
      return res.status(403).json({
        success: false,
        message: "Akses ke data user hanya diperbolehkan untuk super admin.",
      });
    }

    // Load module config
    const modules = await loadModulesConfig();
    const moduleRow = modules.find(
      (row) => row.tabel_name === String(tableName).toLowerCase(),
    );
    if (!moduleRow)
      return res.status(404).json({
        success: false,
        message: `Modul/table '${tableName}' tidak ditemukan di konfigurasi`,
      });

    // Only allow if user's unit_kerja matches module's bidang/unit
    // Allow Sekretariat only for Sekretariat, Bidang Ketersediaan only for Bidang Ketersediaan, etc
    const allowedUnit = (moduleRow.bidang || "").trim();
    const userUnit = (req.user.unit_kerja || "").trim();
    if (allowedUnit && userUnit && allowedUnit !== userUnit) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak: user unit '${userUnit}' tidak boleh akses modul '${allowedUnit}'`,
      });
    }
    next();
  } catch (err) {
    console.error("RBAC middleware error:", err);
    res.status(500).json({
      success: false,
      message: "RBAC check failed",
      error: err.message,
    });
  }
});

// GET table metadata (columns)
router.get("/:tableName/meta", async (req, res) => {
  try {
    const { tableName } = req.params;
    const dbTable = await ensureTableAvailable(tableName);

    if (!dbTable) {
      return res.status(404).json({
        success: false,
        message: `Table '${tableName}' not found`,
      });
    }

    const queryInterface = sequelize.getQueryInterface();
    const description = await queryInterface.describeTable(dbTable);

    const columns = Object.entries(description).map(([name, detail]) => ({
      name,
      type: detail.type,
      allowNull: detail.allowNull,
      defaultValue: detail.defaultValue,
      primaryKey: Boolean(detail.primaryKey),
    }));

    res.json({
      success: true,
      data: {
        table: dbTable,
        columns,
      },
    });
  } catch (error) {
    console.error("Error fetching table metadata:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching table metadata",
      error: error.message,
    });
  }
});

// GET all records from a table
router.get("/:tableName", async (req, res) => {
  try {
    const { tableName } = req.params;
    const model = getModelByName(tableName) || getModelByTableName(tableName);

    let data;

    if (model) {
      data = await model.findAll({
        limit: 1000,
      });
    } else {
      const dbTable = await ensureTableAvailable(tableName);

      if (!dbTable) {
        return res.status(404).json({
          success: false,
          message: `Table '${tableName}' not found`,
        });
      }

      data = await sequelize.query(`SELECT * FROM "${dbTable}" LIMIT 1000`, {
        type: QueryTypes.SELECT,
      });
    }

    res.json({
      success: true,
      data: data,
      count: data.length,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching data",
      error: error.message,
    });
  }
});

// GET single record
router.get("/:tableName/:id", async (req, res) => {
  try {
    const { tableName, id } = req.params;
    const model = getModelByName(tableName) || getModelByTableName(tableName);

    let data = null;

    if (model) {
      data = await model.findByPk(id);
    } else {
      const dbTable = await ensureTableAvailable(tableName);

      if (!dbTable) {
        return res.status(404).json({
          success: false,
          message: `Table '${tableName}' not found`,
        });
      }

      const rows = await sequelize.query(
        `SELECT * FROM "${dbTable}" WHERE id = :id LIMIT 1`,
        {
          replacements: { id },
          type: QueryTypes.SELECT,
        },
      );
      data = rows[0] || null;
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Record not found",
      });
    }

    res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error("Error fetching record:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching record",
      error: error.message,
    });
  }
});

// POST create record
router.post("/:tableName", async (req, res) => {
  try {
    const { tableName } = req.params;
    const model = getModelByName(tableName) || getModelByTableName(tableName);

    let data;

    if (model) {
      data = await model.create(req.body);
    } else {
      const dbTable = await ensureTableAvailable(tableName);
      if (!dbTable) {
        return res.status(404).json({
          success: false,
          message: `Table '${tableName}' not found`,
        });
      }

      const entries = sanitizePayloadColumns(req.body);
      const columns = entries.map(([column]) => column);
      const values = entries.map(([, value]) => value);

      if (!columns.length) {
        return res.status(400).json({
          success: false,
          message: "No valid columns to insert",
        });
      }

      const quotedColumns = columns.map((column) => `"${column}"`).join(", ");
      const placeholders = values.map(() => "?").join(", ");
      await sequelize.query(
        `INSERT INTO "${dbTable}" (${quotedColumns}) VALUES (${placeholders})`,
        {
          replacements: values,
          type: QueryTypes.INSERT,
        },
      );

      const rows = await sequelize.query(
        `SELECT * FROM "${dbTable}" ORDER BY id DESC LIMIT 1`,
        { type: QueryTypes.SELECT },
      );
      data = rows[0] || null;
    }

    res.status(201).json({
      success: true,
      message: "Record created successfully",
      data: data,
    });
  } catch (error) {
    console.error("Error creating record:", error);
    res.status(500).json({
      success: false,
      message: "Error creating record",
      error: error.message,
    });
  }
});

// PUT update record
router.put("/:tableName/:id", async (req, res) => {
  try {
    const { tableName, id } = req.params;
    const model = getModelByName(tableName) || getModelByTableName(tableName);

    let record;

    if (model) {
      record = await model.findByPk(id);

      if (!record) {
        return res.status(404).json({
          success: false,
          message: "Record not found",
        });
      }

      await record.update(req.body);
    } else {
      const dbTable = await ensureTableAvailable(tableName);
      if (!dbTable) {
        return res.status(404).json({
          success: false,
          message: `Table '${tableName}' not found`,
        });
      }

      const entries = sanitizePayloadColumns(req.body);
      if (!entries.length) {
        return res.status(400).json({
          success: false,
          message: "No valid columns to update",
        });
      }

      const setClause = entries.map(([column]) => `"${column}" = ?`).join(", ");
      const values = entries.map(([, value]) => value);

      await sequelize.query(
        `UPDATE "${dbTable}" SET ${setClause} WHERE id = ?`,
        {
          replacements: [...values, id],
          type: QueryTypes.UPDATE,
        },
      );

      const rows = await sequelize.query(
        `SELECT * FROM "${dbTable}" WHERE id = :id LIMIT 1`,
        {
          replacements: { id },
          type: QueryTypes.SELECT,
        },
      );
      record = rows[0] || null;

      if (!record) {
        return res.status(404).json({
          success: false,
          message: "Record not found",
        });
      }
    }

    res.json({
      success: true,
      message: "Record updated successfully",
      data: record,
    });
  } catch (error) {
    console.error("Error updating record:", error);
    res.status(500).json({
      success: false,
      message: "Error updating record",
      error: error.message,
    });
  }
});

// DELETE record
router.delete("/:tableName/:id", async (req, res) => {
  try {
    const { tableName, id } = req.params;
    const model = getModelByName(tableName) || getModelByTableName(tableName);

    if (model) {
      const record = await model.findByPk(id);

      if (!record) {
        return res.status(404).json({
          success: false,
          message: "Record not found",
        });
      }

      await record.destroy();
    } else {
      const dbTable = await ensureTableAvailable(tableName);
      if (!dbTable) {
        return res.status(404).json({
          success: false,
          message: `Table '${tableName}' not found`,
        });
      }

      const rows = await sequelize.query(
        `SELECT id FROM "${dbTable}" WHERE id = :id LIMIT 1`,
        {
          replacements: { id },
          type: QueryTypes.SELECT,
        },
      );

      if (!rows.length) {
        return res.status(404).json({
          success: false,
          message: "Record not found",
        });
      }

      await sequelize.query(`DELETE FROM "${dbTable}" WHERE id = :id`, {
        replacements: { id },
        type: QueryTypes.DELETE,
      });
    }

    res.json({
      success: true,
      message: "Record deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting record:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting record",
      error: error.message,
    });
  }
});

export default router;
