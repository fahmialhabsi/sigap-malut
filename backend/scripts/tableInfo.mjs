import sequelize from "../config/database.js";
(async () => {
  try {
    await sequelize.authenticate();
    const [cols] = await sequelize.query("PRAGMA table_info('users')");
    console.log(JSON.stringify(cols, null, 2));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
