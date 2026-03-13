import bcrypt from "bcrypt";
import { sequelize } from "../../config/database.js";

export async function seedUsers() {
  const passwordHash = await bcrypt.hash("password123", 10);

  await sequelize.query(`
    INSERT INTO Users (email, password, role, dashboardUrl, createdAt, updatedAt)
    VALUES
    ('superadmin@dinpangan.go.id', '${passwordHash}', 'super_admin', '/dashboard/superadmin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('gubernur@example.com', '${passwordHash}', 'gubernur', '/dashboard/superadmin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('sekretaris@example.com', '${passwordHash}', 'sekretaris', '/dashboard/sekretariat', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('kepala_bidang_ketersediaan@example.com', '${passwordHash}', 'kepala_bidang_ketersediaan', '/dashboard/ketersediaan', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('kepala_bidang_distribusi@example.com', '${passwordHash}', 'kepala_bidang_distribusi', '/dashboard/distribusi', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('kepala_bidang_konsumsi@example.com', '${passwordHash}', 'kepala_bidang_konsumsi', '/dashboard/konsumsi', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('kepala_uptd@example.com', '${passwordHash}', 'kepala_uptd', '/dashboard/uptd', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('publik@example.com', '${passwordHash}', 'publik', '/dashboard-publik', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
  `);

  console.log("✅ Users seeded");
}
