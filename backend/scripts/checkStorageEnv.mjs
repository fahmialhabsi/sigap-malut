import { sequelize } from "../config/database.js";
(async () => {
  console.log("NODE_ENV=", process.env.NODE_ENV);
  console.log("DB_DIALECT=", process.env.DB_DIALECT);
  console.log("DB_STORAGE=", process.env.DB_STORAGE);
  console.log("sequelize.options.storage=", sequelize.options.storage);
  await sequelize.close();
})();
