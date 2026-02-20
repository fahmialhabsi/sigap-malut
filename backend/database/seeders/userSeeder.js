import User from "../../models/User.js";
import { hashPassword } from "../../config/auth.js";

const users = [
  {
    username: "superadmin",
    email: "superadmin@dinpangan.go.id",
    password: "Admin123",
    nama_lengkap: "Super Administrator",
    role: "super_admin",
    unit_kerja: "Sekretariat",
    jabatan: "Super Admin System",
    is_verified: true,
  },
  {
    username: "kepala.dinas",
    email: "kepala.dinas@dinpangan.go.id",
    password: "Kadis123",
    nama_lengkap: "Ir. Ahmad Hidayat, M.Si",
    nip: "196501011990031001",
    role: "kepala_dinas",
    unit_kerja: "Sekretariat",
    jabatan: "Kepala Dinas Pangan",
    is_verified: true,
  },
  {
    username: "sekretaris",
    email: "sekretaris@dinpangan.go.id",
    password: "Sek123",
    nama_lengkap: "Dra. Siti Aminah, M.AP",
    nip: "196701011991032001",
    role: "sekretaris",
    unit_kerja: "Sekretariat",
    jabatan: "Sekretaris Dinas",
    is_verified: true,
    // Pastikan role bukan super_admin
  },
  // ... (15 user total - akan saya lengkapi jika Anda setuju)
];

export async function seedUsers() {
  console.log("🌱 Seeding users...");

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
