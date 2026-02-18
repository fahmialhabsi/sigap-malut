import { sequelize } from "../../config/database.js";
import { seedUsers } from "./userSeeder.js";
import { seedMasterData } from "./masterDataSeeder.js";
import { seedTransactionalData } from "./transactionalSeeder.js";

async function runSeeders() {
  console.log("🌱 Starting Database Seeding...\n");

  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established\n");

    // 1. Seed Users
    await seedUsers();

    // 2. Seed Master Data
    await seedMasterData();

    // 3. Seed Transactional Data
    await seedTransactionalData();

    await sequelize.close();
    console.log("✅ Database connection closed\n");

    console.log("🎉 All seeders complete!\n");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

runSeeders();
