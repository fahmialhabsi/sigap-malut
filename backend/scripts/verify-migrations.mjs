#!/usr/bin/env node
/**
 * Verifikasi SequelizeMeta + migrasi kritis (exit 0/1).
 * Usage: node scripts/verify-migrations.mjs
 */
import { sequelize } from "../config/database.js";
import { verifyCliMigrationReadiness } from "../services/migrationReadinessService.js";

async function main() {
  try {
    await sequelize.authenticate();
  } catch (e) {
    console.error("DB auth failed:", e.message);
    process.exit(1);
  }
  if (sequelize.getDialect() !== "postgres") {
    console.log(
      JSON.stringify({
        skipped: true,
        dialect: sequelize.getDialect(),
        note: "Verifikasi SequelizeMeta untuk pipeline Postgres; SQLite lewati.",
      }),
    );
    await sequelize.close();
    process.exit(0);
  }
  const r = await verifyCliMigrationReadiness(sequelize);
  console.log(JSON.stringify({ ok: r.ok, metaTableExists: r.metaTableExists, missingCritical: r.missingCritical }, null, 2));
  await sequelize.close();
  process.exit(r.ok ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
