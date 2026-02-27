import { sequelize } from "../config/database.js";
(async () => {
  try {
    await sequelize.authenticate();
    const [rows] = await sequelize.query("SELECT COUNT(*) as c FROM users");
    console.log("sequelize raw rows:", rows);
    await sequelize.close();
  } catch (e) {
    console.error("ERROR raw query:", e);
    process.exit(1);
  }
})();
