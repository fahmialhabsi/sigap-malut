import sequelize from "../config/database.js";
import bcrypt from "bcrypt";

(async () => {
  try {
    await sequelize.authenticate();
    const [rows] = await sequelize.query(
      "SELECT password FROM users WHERE username='super_admin' LIMIT 1",
    );
    console.log("row=", rows[0]);
    const ok = await bcrypt.compare("Admin123", rows[0].password);
    console.log("bcrypt compare result=", ok);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
