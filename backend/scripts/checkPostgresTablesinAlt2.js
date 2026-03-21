import { sequelize } from "../config/database.js";

console.log("\n📊 Checking PostgreSQL database tables:\n");

try {
  const tables = await sequelize.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  `);

  const rows = tables[0];
  if (rows.length > 0) {
    console.log(`Found ${rows.length} tables:`);
    rows.forEach((row) => {
      console.log(`  - ${row.table_name}`);
    });

    // Check if roles table exists
    const hasRoles = rows.some((row) => row.table_name === "roles");
    console.log(`\n✅ Roles table exists: ${hasRoles ? "YES" : "NO"}`);

    if (hasRoles) {
      // Check columns
      const colResult = await sequelize.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'roles'
      `);

      const cols = colResult[0];
      console.log("\nRoles table columns:");
      cols.forEach((row) => {
        console.log(`  - ${row.column_name}`);
      });

      const hasCode = cols.some((row) => row.column_name === "code");
      console.log(`\n✅ Code column exists: ${hasCode ? "YES" : "NO"}`);
    }
  } else {
    console.log("(No tables found)");
  }
} catch (err) {
  console.error("\n❌ Error:", err.message);
} finally {
  await sequelize.close();
  process.exit(0);
}
