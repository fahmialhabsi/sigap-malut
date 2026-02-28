import sequelize from "../config/database.js";
import initModels from "../models/index.js";

(async () => {
  try {
    await sequelize.authenticate();
    const models = await initModels(sequelize);
    console.log("models keys:", Object.keys(models));
    const User = models.User;
    if (!User) {
      console.log("User model not found");
      process.exit(1);
    }
    const u = await User.findOne({ where: { username: "super_admin" } });
    console.log("model findOne ->", u && (u.get ? u.get() : u));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
