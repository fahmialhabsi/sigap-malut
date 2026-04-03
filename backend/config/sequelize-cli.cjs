/**
 * Konfigurasi untuk sequelize-cli (db:migrate).
 * Jalankan dari folder backend: npx sequelize-cli db:migrate
 */
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const dialect = process.env.DB_DIALECT || "sqlite";

const sqliteStorage =
  process.env.DB_STORAGE ||
  path.join(__dirname, "../database/database.sqlite");

const postgres = {
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "sigap_malut",
  host: process.env.DB_HOST || "127.0.0.1",
  port: process.env.DB_PORT || 5432,
  dialect: "postgres",
  logging: false,
};

const sqlite = {
  dialect: "sqlite",
  storage: sqliteStorage,
  logging: false,
};

const base = dialect === "postgres" ? postgres : sqlite;

module.exports = {
  development: { ...base },
  test: { ...base },
  production: { ...base },
};
