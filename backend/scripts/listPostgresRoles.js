import { sequelize } from "../config/database.js";

console.log("\n📋 Available roles in PostgreSQL:\n");

try {
  const [roles] = await sequelize.query(
    "SELECT id, name, code, is_active FROM roles ORDER BY level LIMIT 15",
  );

  roles.forEach((role) => {
    console.log(`  ID: ${role.id}`);
    console.log(`  Name: ${role.name} (code: ${role.code})`);
    console.log(`  Active: ${role.is_active}`);
    console.log("");
  });

  // Find the kepala_dinas role
  const [kepala] = await sequelize.query(
    `SELECT id, name FROM roles WHERE code = 'kepala_dinas' LIMIT 1`,
  );
  if (kepala.length > 0) {
    console.log(`\n✅ Kepala Dinas role ID: ${kepala[0].id}`);
  }
} catch (err) {
  console.error("Error:", err.message);
} finally {
  await sequelize.close();
  process.exit(0);
}
