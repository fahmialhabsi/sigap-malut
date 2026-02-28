import sequelize from "../config/database.js";

(async function () {
  try {
    await sequelize.authenticate();
    const [rows] = await sequelize.query(
      "SELECT id, username, email, password FROM users WHERE username = 'super_admin' LIMIT 1",
    );
    console.log(rows);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
