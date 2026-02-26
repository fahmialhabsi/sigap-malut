import User from "../../models/User.js";
import { hashPassword } from "../../config/auth.js";

const users = [
  {
    username: "superadmin",
    email: "superadmin@dinpangan.go.id",
    password: "superadmin123",
    nama_lengkap: "Super Administrator",
    role: "super_admin",
    unit_kerja: "Sekretariat",
    jabatan: "Super Admin System",
    is_verified: true,
    is_active: true,
  },
  {
    username: "sekretaris",
    email: "sekretaris@dinpangan.go.id",
    password: "123",
    nama_lengkap: "Sekretaris Dinas",
    role: "sekretaris",
    unit_kerja: "Sekretariat",
    jabatan: "Sekretaris",
    is_verified: true,
    is_active: true,
  },
];

async function seedUsers() {
  console.log("🌱 Seeding users (superadmin only)...");

  // Hapus semua user lama
  await User.destroy({ where: {}, truncate: true });

  for (const userData of users) {
    try {
      // Hash password
      const hashedPassword = await hashPassword(userData.password);

      await User.create({
        ...userData,
        password: hashedPassword,
      });

      console.log(`  ✅ Created: ${userData.username}`);
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        console.log(`  ⚠️  Skipped (exists): ${userData.username}`);
      } else {
        console.error(
          `  ❌ Error creating ${userData.username}:`,
          error.message,
        );
      }
    }
  }

  console.log("✅ User seeding complete!\n");
}

seedUsers();
