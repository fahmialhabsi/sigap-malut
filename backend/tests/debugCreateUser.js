import User from "../models/User.js";
import { sequelize } from "../config/database.js";

(async () => {
  try {
    await sequelize.sync();
    const uniq = Date.now();
    const payload = {
      username: `softdelete${uniq}`,
      name: "SoftDelete",
      password: "password123",
      unit_id: "unit-1",
      role_id: "pelaksana",
      unit_kerja: "Sekretariat",
      email: `soft${uniq}@delete.com`,
      jabatan: "Staff",
    };
    const instance = User.build(payload);
    try {
      await instance.validate();
      const user = await instance.save();
      console.log("Created user", user.id);
    } catch (vErr) {
      console.error(
        "Validation error details:",
        vErr.name,
        vErr.errors
          ? vErr.errors.map((e) => ({ path: e.path, message: e.message }))
          : vErr.message,
      );
    }
  } catch (err) {
    console.error(
      "Create user error:",
      err.name,
      err.errors ? err.errors.map((e) => e.message) : err.message,
    );
  } finally {
    await sequelize.close();
  }
})();
