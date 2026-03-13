import { sequelize } from "../config/database.js";

console.log("\n🔧 Checking sek_keu.created_by column type...\n");

try {
  const [columns] = await sequelize.query(`
    SELECT data_type, udt_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'sek_keu'
      AND column_name = 'created_by'
  `);

  if (!columns.length) {
    throw new Error("Column sek_keu.created_by not found");
  }

  const currentType = columns[0].data_type || columns[0].udt_name;
  console.log(`Current type: ${currentType}`);

  if (currentType === "integer" || currentType === "int4") {
    console.log("✅ sek_keu.created_by is already INTEGER. No changes needed.");
    process.exit(0);
  }

  const [invalidRows] = await sequelize.query(`
    SELECT COUNT(*)::int AS count
    FROM sek_keu
    WHERE created_by IS NOT NULL
      AND created_by::text !~ '^[0-9]+$'
  `);

  const invalidCount = Number(invalidRows[0]?.count || 0);
  if (invalidCount > 0) {
    throw new Error(
      `Found ${invalidCount} non-numeric created_by value(s) in sek_keu. Aborting automatic conversion.`,
    );
  }

  const [constraints] = await sequelize.query(`
    SELECT c.conname
    FROM pg_constraint c
    JOIN pg_class t ON c.conrelid = t.oid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(c.conkey)
    WHERE n.nspname = 'public'
      AND t.relname = 'sek_keu'
      AND a.attname = 'created_by'
      AND c.contype = 'f'
  `);

  await sequelize.transaction(async (transaction) => {
    for (const constraint of constraints) {
      await sequelize.query(
        `ALTER TABLE sek_keu DROP CONSTRAINT IF EXISTS "${constraint.conname}"`,
        { transaction },
      );
      console.log(`ℹ️  Dropped constraint: ${constraint.conname}`);
    }

    await sequelize.query(
      `
        ALTER TABLE sek_keu
        ALTER COLUMN created_by TYPE INTEGER
        USING NULLIF(created_by::text, '')::integer
      `,
      { transaction },
    );
  });

  const [updatedColumns] = await sequelize.query(`
    SELECT data_type, udt_name
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'sek_keu'
      AND column_name = 'created_by'
  `);

  const updatedType = updatedColumns[0]?.data_type || updatedColumns[0]?.udt_name;
  console.log(`✅ sek_keu.created_by updated successfully to ${updatedType}`);
} catch (error) {
  console.error("\n❌ Error:", error.message);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}