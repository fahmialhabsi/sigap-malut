import { seedMasterData } from "../database/seeders/masterDataSeeder.js";
import { sequelize } from "../config/database.js";

(async () => {
  try {
    console.log("Runner env:", {
      NODE_ENV: process.env.NODE_ENV,
      DB_DIALECT: process.env.DB_DIALECT,
      DB_STORAGE: process.env.DB_STORAGE,
    });
    console.log("Sequelize options:", {
      dialect: sequelize.getDialect(),
      storage: sequelize.options.storage,
    });
    await seedMasterData();
    console.log("Master seeder completed");
    await sequelize.close();
    process.exit(0);
  } catch (e) {
    console.error("Master seeder error:", e);
    try {
      await sequelize.close();
    } catch (_) {}
    process.exit(1);
  }
})();
