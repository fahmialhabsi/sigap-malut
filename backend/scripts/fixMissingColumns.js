import { sequelize } from "../config/database.js";

console.log("\n🔧 Adding missing columns to roles table in PostgreSQL...\n");

try {
  // Add the missing columns
  const columns = [
    {
      name: "default_permissions",
      sql: `ALTER TABLE roles ADD COLUMN IF NOT EXISTS default_permissions JSONB DEFAULT '[]'`,
    },
    {
      name: "position_id",
      sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS position_id VARCHAR(100)`,
    },
  ];

  for (const col of columns) {
    try {
      await sequelize.query(col.sql);
      console.log(`✅ Added column: ${col.name}`);
    } catch (err) {
      if (err.message.includes("already exists")) {
        console.log(`ℹ️  Column already exists: ${col.name}`);
      } else {
        throw err;
      }
    }
  }

  // Check roles table structure
  console.log("\n📋 Updated roles table columns:");
  const [columns_result] = await sequelize.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'roles'
    ORDER BY ordinal_position
  `);

  columns_result.forEach((col) => {
    console.log(`  - ${col.column_name}`);
  });

  console.log("\n✨ Database schema updated!");
} catch (err) {
  console.error("\n❌ Error:", err.message);
} finally {
  await sequelize.close();
  process.exit(0);
}
