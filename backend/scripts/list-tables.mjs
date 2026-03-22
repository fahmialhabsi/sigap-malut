// list-tables.cjs — Query daftar tabel aktual di database
import("../config/database.js")
  .then(async (m) => {
    const seq = m.default;
    await seq.authenticate();
    const [tables] = await seq.query(
      "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename",
    );
    console.log("=== TABEL DI DATABASE ===");
    tables.forEach((t) => console.log(t.tablename));
    process.exit(0);
  })
  .catch((e) => {
    console.error("ERROR:", e.message);
    process.exit(1);
  });
