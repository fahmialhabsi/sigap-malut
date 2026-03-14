import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load backend/.env secara eksplisit
dotenv.config({ path: path.resolve(process.cwd(), "backend/.env") });

const required = [
  "DB_DIALECT",
  "DB_HOST",
  "DB_PORT",
  "DB_NAME",
  "DB_USER",
  "DB_PASSWORD",
];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required PostgreSQL config: ${key}`);
  }
}

if ((process.env.DB_DIALECT || "").toLowerCase() !== "postgres") {
  throw new Error(
    "Only PostgreSQL is supported. Set DB_DIALECT=postgres in backend/.env",
  );
}

const enableSqlLogging = process.env.SQL_LOGGING === "true";

export const sequelize = new Sequelize({
  dialect: "postgres",
  host: process.env.DB_HOST,
  port: Number.parseInt(process.env.DB_PORT, 10),
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
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
});
