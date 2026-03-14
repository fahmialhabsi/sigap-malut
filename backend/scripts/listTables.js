import { sequelize } from "../config/database.js";

async function listTables() {
  const dialect = sequelize.getDialect();
  let query;
  if (dialect === "postgres") {
    query =
      "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public' ORDER BY tablename;";
  } else if (dialect === "sqlite") {
    query = "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;";
  } else {
    console.error("Unsupported dialect:", dialect);
    process.exit(1);
  }
  try {
    const [rows] = await sequelize.query(query);
    console.log(`Found ${rows?.length || 0} tables`);
    rows?.forEach((r) => console.log(`  - ${r.tablename || r.name}`));
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await sequelize.close();
  }
}

listTables();
