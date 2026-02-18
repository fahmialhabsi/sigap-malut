// Map CSV field type to SQL type
export function mapTypeToSQL(field) {
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

// Generate SQL CREATE TABLE statement
export function generateCreateTableSQL(tableName, fields) {
  let sql = `CREATE TABLE IF NOT EXISTS ${tableName} (\n`;

  const columns = fields.map((field) => {
    let columnDef = `  ${field.field_name} ${mapTypeToSQL(field)}`;

    if (field.is_required === "true" && field.field_type !== "auto_increment") {
      columnDef += " NOT NULL";
    }

    if (field.is_unique === "true") {
      columnDef += " UNIQUE";
    }

    if (field.default_value && field.default_value !== "NULL") {
      if (field.default_value === "CURRENT_TIMESTAMP") {
        columnDef += " DEFAULT CURRENT_TIMESTAMP";
      } else if (["varchar", "enum", "text"].includes(field.field_type)) {
        columnDef += ` DEFAULT '${field.default_value}'`;
      } else {
        columnDef += ` DEFAULT ${field.default_value}`;
      }
    }

    return columnDef;
  });

  sql += columns.join(",\n");
  sql += "\n);";

  return sql;
}

// Generate indexes
export function generateIndexesSQL(tableName, fields) {
  const indexableFields = fields.filter(
    (f) =>
      (f.field_name.endsWith("_id") && f.field_name !== "id") ||
      f.field_name === "status" ||
      f.field_name === "created_at" ||
      f.field_name === "unit_kerja" ||
      f.field_name === "layanan_id",
  );

  return indexableFields
    .map(
      (field) =>
        `CREATE INDEX IF NOT EXISTS idx_${tableName}_${field.field_name} ON ${tableName}(${field.field_name});`,
    )
    .join("\n");
}

export default {
  mapTypeToSQL,
  generateCreateTableSQL,
  generateIndexesSQL,
};
