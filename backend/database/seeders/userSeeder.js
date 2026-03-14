// backend/database/seeders/userSeeder.js

import bcrypt from "bcrypt";

export async function seedUsers(queryInterface) {
  const passwordHash = await bcrypt.hash("password123", 10);

  await queryInterface.bulkInsert("Users", [
    {
      id: 1,
      email: "superadmin@dinpangan.go.id",
      password: passwordHash,
      role: "super_admin",
      dashboardUrl: "/dashboard/superadmin",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      email: "gubernur@example.com",
      password: passwordHash,
      role: "gubernur",
      dashboardUrl: "/dashboard/superadmin",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      email: "sekretaris@example.com",
      password: passwordHash,
      role: "sekretaris",
      dashboardUrl: "/dashboard/sekretariat",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 4,
      email: "kepala_bidang_ketersediaan@example.com",
      password: passwordHash,
      role: "kepala_bidang_ketersediaan",
      dashboardUrl: "/dashboard/ketersediaan",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);
}
