// Map CSV type to Sequelize DataType
export function mapTypeToSequelize(field) {
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

// Convert to camelCase
export function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}

// Convert to PascalCase
export function toPascalCase(str) {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

export default {
  mapTypeToSequelize,
  toCamelCase,
  toPascalCase,
};
