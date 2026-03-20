import { sequelize } from "../config/database.js";

console.log("\n📊 Database Configuration:");
console.log(`  Dialect: ${sequelize.getDialect()}`);
console.log(`  Host: ${sequelize.config.host || "N/A (SQLite)"}`);
console.log(
  `  Database: ${sequelize.config.database || sequelize.config.storage}`,
);
console.log(
  `  Environment DB_DIALECT: ${process.env.DB_DIALECT || "(not set, will use default)"}`,
);
console.log(`  Environment NODE_ENV: ${process.env.NODE_ENV || "development"}`);

await sequelize.authenticate();
console.log("\n✅ Database connection successful");

process.exit(0);
