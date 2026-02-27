import { sequelize } from "../config/database.js";
(async () => {
  try {
    await sequelize.authenticate();
    const [rows] = await sequelize.query(
      "SELECT COUNT(*) as c FROM master_komoditas",
    );
    console.log("master_komoditas:", rows);
    await sequelize.close();
  } catch (e) {
    console.error("ERROR raw query master_komoditas:", e);
    process.exit(1);
  }
})();
