import sequelize from "../config/database.js";
import initModels from "../models/index.js";
(async () => {
  try {
    await sequelize.authenticate();
    const models = await initModels(sequelize);
    const User = models.User;
    console.log("User model present=", !!User);
    if (User) {
      console.log("rawAttributes keys:", Object.keys(User.rawAttributes));
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
