/**
 * Menjalankan migrasi execution thread di PostgreSQL (atau dialect aktif).
 * npm run dev TIDAK menjalankan file di backend/migrations/ — hanya sequelize.sync().
 */
import { createRequire } from "module";
import { sequelize } from "../config/database.js";
import SequelizePkg from "sequelize";

const require = createRequire(import.meta.url);
const migration = require("../migrations/20260406-execution-thread-id.cjs");

const qi = sequelize.getQueryInterface();
await migration.up(qi, SequelizePkg);
console.log("✅ Migrasi execution_thread_id selesai.");
await sequelize.close();
