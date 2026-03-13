import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const enableSqlLogging = process.env.SQL_LOGGING === "true";
const requestedDialect = (process.env.DB_DIALECT || "postgres").toLowerCase();

const hasPostgresConfig = Boolean(
  process.env.DATABASE_URL ||
  process.env.DB_HOST ||
  process.env.DB_NAME ||
  process.env.DB_USER,
);

const usePostgres =
  requestedDialect === "postgres" &&
  (hasPostgresConfig || process.env.NODE_ENV === "production");

if (!usePostgres && requestedDialect === "postgres") {
  console.warn(
    "[database] PostgreSQL diprioritaskan, tetapi konfigurasi belum lengkap. Fallback ke SQLite diaktifkan.",
  );
}

const baseConfig = {
  logging: enableSqlLogging ? console.log : false,
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
};

const sequelizeConfig = usePostgres
  ? process.env.DATABASE_URL
    ? {
        ...baseConfig,
        dialect: "postgres",
      }
    : {
        ...baseConfig,
        dialect: "postgres",
        host: process.env.DB_HOST || "127.0.0.1",
        port: Number.parseInt(process.env.DB_PORT || "5432", 10),
        database: process.env.DB_NAME || "sigap_malut",
        username: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "postgres",
      }
  : {
      ...baseConfig,
      dialect: "sqlite",
      storage:
        process.env.DB_STORAGE ||
        path.join(__dirname, "../database/database.sqlite"),
    };

const sequelize =
  process.env.DATABASE_URL && usePostgres
    ? new Sequelize(process.env.DATABASE_URL, sequelizeConfig)
    : new Sequelize(sequelizeConfig);

// Test connection
async function testConnection() {
  try {
    await sequelize.authenticate();
  } catch (error) {
    console.error("❌ Unable to connect to database:", error.message);
    process.exit(1);
  }
}

export { sequelize, testConnection };
export default sequelize;
