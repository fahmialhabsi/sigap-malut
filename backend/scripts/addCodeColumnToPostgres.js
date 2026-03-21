import { sequelize } from "../config/database.js";

console.log("\n🔧 Adding code column to roles table in PostgreSQL...\n");

try {
  // Add the 'code' column if it doesn't exist
  await sequelize.query(`
    ALTER TABLE roles 
    ADD COLUMN IF NOT EXISTS code VARCHAR(100) UNIQUE
  `);

  console.log("✅ Code column added successfully");

  // Create index for role code lookup
  await sequelize.query(`
    CREATE INDEX IF NOT EXISTS idx_roles_code ON roles("code")
  `);

  console.log("✅ Index created successfully");

  // Seed the code column for existing roles based on their names
  const updateQueries = [
    `UPDATE roles SET code = 'kepala_dinas' WHERE name ILIKE '%kepala%dinas%' AND code IS NULL`,
    `UPDATE roles SET code = 'sekretaris' WHERE name ILIKE '%sekretaris%' AND code IS NULL`,
    `UPDATE roles SET code = 'kepala_bidang' WHERE name ILIKE '%kepala%bidang%' AND code IS NULL`,
    `UPDATE roles SET code = 'kepala_uptd' WHERE name ILIKE '%kepala%uptd%' AND code IS NULL`,
    `UPDATE roles SET code = 'gubernur' WHERE name ILIKE '%gubernur%' AND code IS NULL`,
    `UPDATE roles SET code = 'publik' WHERE name ILIKE '%publik%' AND code IS NULL`,
    `UPDATE roles SET code = 'superadmin' WHERE name ILIKE '%super%' AND code IS NULL`,
    `UPDATE roles SET code = LOWER(REPLACE(REPLACE(name, ' ', '_'), '-', '_')) WHERE code IS NULL`,
  ];

  for (const query of updateQueries) {
    const result = await sequelize.query(query);
    if (Array.isArray(result) && result[1] && result[1] > 0) {
      console.log(`  ✅ Updated ${result[1]} role(s)`);
    }
  }

  // Display all roles with their codes
  const [roles] = await sequelize.query(
    "SELECT id, name, code, level FROM roles ORDER BY level",
  );
  console.log("\n📋 Roles in database:");
  roles.forEach((role) => {
    console.log(
      `  [${role.level}] ${role.name} (code: ${role.code || "NULL"})`,
    );
  });

  console.log("\n✨ All roles have codes!");
} catch (err) {
  console.error("\n❌ Error:", err.message);
} finally {
  await sequelize.close();
  process.exit(0);
}
