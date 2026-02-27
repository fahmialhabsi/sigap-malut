import User from "../../models/User.js";
import { hashPassword } from "../../config/auth.js";
import sequelize from "../../config/database.js";

const users = [
  {
    username: "superadmin",
    email: "superadmin@dinpangan.go.id",
    password: "Admin123",
    nama_lengkap: "Super Administrator",
    name: "Super Administrator",
    role: "super_admin",
    role_id: "167289b5-bcdb-4749-a404-f6e1360a9c86",
    unit_kerja: "Sekretariat",
    unit_id: "79ad8fa7-e345-49ac-a4bc-da62c9bd3963",
    jabatan: "Super Admin System",
    is_verified: 1,
    is_active: 1,
  },
  {
    username: "sekretaris",
    email: "sekretaris@dinpangan.go.id",
    password: "Staff123",
    nama_lengkap: "Sekretaris Dinas",
    name: "Sekretaris Dinas",
    role: "sekretaris",
    role_id: "5f164dec-dc5f-4d57-bab2-0b61eeabe534",
    unit_kerja: "Sekretariat",
    unit_id: "79ad8fa7-e345-49ac-a4bc-da62c9bd3963",
    jabatan: "Sekretaris",
    is_verified: 1,
    is_active: 1,
  },
  {
    username: "kabiddistribusi",
    email: "kabiddistribusi@dinpangan.go.id",
    password: "Distribusi123",
    nama_lengkap: "Kepala Bidang Distribusi",
    name: "Kepala Bidang Distribusi",
    role: "kepala_bidang_distribusi",
    role_id: "468f7103-2c95-4b1d-b288-cbb082bb0963",
    unit_kerja: "Bidang Distribusi",
    unit_id: "ff0f2ba0-321f-4305-9f5d-a013f7b88fbb",
    jabatan: "Kepala Bidang Distribusi dan Cadangan Pangan",
    is_verified: 1,
    is_active: 1,
  },
];

export async function seedUsers() {
  console.log("🌱 Seeding ALL USERS (setiap kombinasi role-unit)...");

  // Use raw DELETE to avoid dialect-specific bulkUpdate/truncate quirks
  await sequelize.query(`DELETE FROM users`);

  for (const userData of users) {
    try {
      const hashedPassword = await hashPassword(userData.password);
      await User.create({ ...userData, password: hashedPassword });
      console.log(`  ✅ Created: ${userData.email}`);
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        console.log(`  ⚠️  Skipped (exists): ${userData.email}`);
      } else {
        console.error(`  ❌ Error creating ${userData.email}:`, error.message);
      }
    }
  }

  console.log("✅ All user seeding complete!\n");
}
