import { sequelize } from "../config/database.js";

(async () => {
  try {
    const [cols] = await sequelize.query("PRAGMA table_info('users');");
    console.log("users table columns:", cols);
    const [indexes] = await sequelize.query("PRAGMA index_list('users');");
    console.log("users indexes:", indexes);
    for (const idx of indexes) {
      const [info] = await sequelize.query(`PRAGMA index_info('${idx.name}');`);
      console.log("index info", idx.name, info);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
})();
