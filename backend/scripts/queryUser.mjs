import sequelize from "../config/database.js";

(async function () {
  try {
    await sequelize.authenticate();
    const [rows] = await sequelize.query(
      "SELECT id, username, email, password, role_id FROM users LIMIT 20",
    );
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
