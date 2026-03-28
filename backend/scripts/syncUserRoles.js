/**
 * syncUserRoles.js — Sync kolom users.role dari role_id FK
 * Jalankan: node scripts/syncUserRoles.js
 */
import sequelize from "../config/database.js";

await sequelize.authenticate();
console.log("✅ DB connected\n");

// Update semua user yang role-nya berbeda dari code di tabel roles
const [, meta] = await sequelize.query(`
  UPDATE users
  SET role = r.code,
      updated_at = CURRENT_TIMESTAMP
  FROM roles r
  WHERE users.role_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    AND users.role_id::uuid = r.id
    AND r.code IS NOT NULL
    AND r.code != ''
    AND users.role != r.code
`);

console.log(`✅ Synced ${meta?.rowCount ?? "?"} user(s) role column from role_id FK`);

// Tampilkan hasil
const [rows] = await sequelize.query(`
  SELECT u.username, u.email, u.role, r.code as role_from_fk
  FROM users u
  LEFT JOIN roles r ON u.role_id ~ '^[0-9a-f-]{36}$' AND u.role_id::uuid = r.id
  ORDER BY u.username
  LIMIT 20
`);

console.log("\nDaftar user dan role saat ini:");
rows.forEach((r) => {
  const match = r.role === r.role_from_fk ? "✅" : "⚠️ ";
  console.log(`  ${match} ${r.username.padEnd(25)} role="${r.role}"  fk_code="${r.role_from_fk ?? "(no role_id)"}"`);
});

await sequelize.close();
