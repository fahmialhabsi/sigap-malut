// Add missing columns to Tasks table to match spec in doc 14
export const up = async (queryInterface, Sequelize) => {
  // Add columns that were missing from the original migration
  const tableDescription = await queryInterface.describeTable("Tasks");

  const addIfMissing = async (columnName, definition) => {
    if (!tableDescription[columnName]) {
      await queryInterface.addColumn("Tasks", columnName, definition);
    }
  };

  await addIfMissing("module", {
    type: Sequelize.STRING(100),
    allowNull: true,
  });
  await addIfMissing("source_unit", {
    type: Sequelize.STRING(100),
    allowNull: true,
  });
  await addIfMissing("sla_seconds", {
    type: Sequelize.INTEGER,
    allowNull: true,
  });
  await addIfMissing("metadata", { type: Sequelize.JSON, allowNull: true });

  // Extend status ENUM if using PostgreSQL
  // SQLite doesn't enforce ENUM, so this is fine for dev
  // For Postgres, we'd need to alter the type
};

export const down = async (queryInterface) => {
  await queryInterface.removeColumn("Tasks", "module").catch(() => {});
  await queryInterface.removeColumn("Tasks", "source_unit").catch(() => {});
  await queryInterface.removeColumn("Tasks", "sla_seconds").catch(() => {});
  await queryInterface.removeColumn("Tasks", "metadata").catch(() => {});
};
