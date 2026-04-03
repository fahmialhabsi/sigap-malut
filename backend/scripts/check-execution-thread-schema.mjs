import { sequelize } from "../config/database.js";

const [cols] = await sequelize.query(`
  SELECT table_name, column_name
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND column_name = 'execution_thread_id'
  ORDER BY table_name
`);
console.log("Tables with execution_thread_id:", cols);

const [ev] = await sequelize.query(`
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'execution_thread_events'
  ) AS exists
`);
console.log("execution_thread_events exists:", ev[0]?.exists);

try {
  const [meta] = await sequelize.query(
    `SELECT name FROM "SequelizeMeta" WHERE name LIKE '%execution%' ORDER BY name`,
  );
  console.log("SequelizeMeta rows:", meta);
} catch (e) {
  console.log("SequelizeMeta (skip):", e.message);
}

for (const tbl of [
  "Tasks",
  "instruksi_gubernur",
  "pengajuan_ke_gubernur",
  "clarification_threads",
]) {
  const [rows] = await sequelize.query(
    `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '${tbl}' AND column_name = 'execution_thread_id'`,
  );
  console.log(`${tbl}.execution_thread_id:`, rows.length ? "YES" : "NO");
}

await sequelize.close();
