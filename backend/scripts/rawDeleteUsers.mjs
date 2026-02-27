import { sequelize } from "../config/database.js";
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Before delete:");
    const [r1] = await sequelize.query("SELECT COUNT(*) as c FROM users");
    console.log(r1);
    await sequelize.query("DELETE FROM users");
    console.log("Deleted");
    const [r2] = await sequelize.query("SELECT COUNT(*) as c FROM users");
    console.log(r2);
    await sequelize.close();
  } catch (e) {
    console.error("ERROR raw delete:", e);
    process.exit(1);
  }
})();
