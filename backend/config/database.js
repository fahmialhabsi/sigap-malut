import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  logging: process.env.NODE_ENV === "development" ? console.log : false,

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
