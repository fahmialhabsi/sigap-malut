import { Sequelize } from "sequelize";

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Selalu load .env dari root project (dua folder di atas config/database.js)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
if (process.env.SIGAP_SKIP_DB_DIALECT_LOG !== "1") {
  console.log("DB_DIALECT:", process.env.DB_DIALECT);
}

const sequelizeLoggingEnv = String(
  process.env.SEQUELIZE_LOGGING ?? "",
).toLowerCase();
const sequelizeLoggingEnabled =
  sequelizeLoggingEnv === "true" ||
  sequelizeLoggingEnv === "1" ||
  (!["false", "0", "off", "no"].includes(sequelizeLoggingEnv) &&
    process.env.NODE_ENV === "development");

const sequelize = new Sequelize({
  dialect: process.env.DB_DIALECT || "sqlite",
  storage:
    process.env.DB_STORAGE ||
    // Use in-memory SQLite for tests to avoid native binary issues in CI/runners
    (process.env.NODE_ENV === "test"
      ? ":memory:"
      : path.join(__dirname, "../database/database.sqlite")),

  // PostgreSQL config (for production)
  ...(process.env.DB_DIALECT === "postgres" && {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  }),

  logging: sequelizeLoggingEnabled ? console.log : false,

  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true,
  },

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

// Test connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");
  } catch (error) {
    console.error("❌ Unable to connect to database:", error.message);
    process.exit(1);
  }
}

export { sequelize, testConnection };
export default sequelize;
