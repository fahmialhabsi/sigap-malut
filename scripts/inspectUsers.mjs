import { sequelize } from "../backend/config/database.js";
import User from "../backend/models/User.js";

async function inspect() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    const users = await User.findAll({ raw: true });
    console.log("Users (raw):", users);

    const users2 = await User.findAll();
    console.log(
      "Users (toJSON):",
      users2.map((u) => u.toJSON()),
    );

    const [tableInfo] = await sequelize.query("PRAGMA table_info('users');");
    console.log("users table info:", tableInfo);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

inspect();
