import { sequelize } from "../../config/database.js";
import { seedUsers } from "./userSeeder.js";
import { seedMasterData } from "./masterDataSeeder.js";
import { seedTransactionalData } from "./transactionalSeeder.js";
import {
  seedBendaharaPengeluaranUpDemo,
  seedBendaharaGajiDemo,
  seedBendaharaBarangDemo,
  seedKeuanganPpkDemo,
  seedPelaksanaSekretariatDemo,
  seedUserHierarchyKasubagDemo,
} from "./hierarchySeeder.js";

async function runSeeders() {
  console.log("🌱 Starting Database Seeding...\n");

  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established\n");

    // 1. Seed Users
    await seedUsers();

    // 2. Seed Master Data
    try {
      await seedMasterData();
    } catch (err) {
      console.warn(
        "⚠️  Seed master data dilewati (tabel belum tersedia):",
        err?.message || err,
      );
    }

    // 3. Seed Transactional Data
    try {
      await seedTransactionalData();
    } catch (err) {
      console.warn(
        "⚠️  Seed transactional data dilewati (tabel belum tersedia):",
        err?.message || err,
      );
    }

    // 4. Seed user_hierarchy + demo tasks (Kasubag Prompt 4)
    await seedUserHierarchyKasubagDemo();

    // 5. Seed demo SPJ/DPA untuk PPK Queue (Prompt 6)
    await seedKeuanganPpkDemo();

    // 6. Seed demo saldo UP awal (Prompt 7)
    await seedBendaharaPengeluaranUpDemo();

    // 7. Seed demo daftar gaji (Prompt 8)
    await seedBendaharaGajiDemo();

    // 8. Seed demo Bendahara Barang/BMD (Prompt 9)
    await seedBendaharaBarangDemo();

    // 9. Seed demo Pelaksana Sekretariat (Prompt 10)
    await seedPelaksanaSekretariatDemo();

    await sequelize.close();
    console.log("✅ Database connection closed\n");

    console.log("🎉 All seeders complete!\n");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

runSeeders();
