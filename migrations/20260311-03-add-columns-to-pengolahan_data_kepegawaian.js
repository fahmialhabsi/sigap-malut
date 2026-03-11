// migrations/20260311-03-add-columns-to-pengolahan_data_kepegawaian.js
// Adds additional audit/workflow columns to pengolahan_data_kepegawaian table
// if it exists (table may not be present in all environments).

export const up = async (queryInterface, Sequelize) => {
  const tables = await queryInterface.showAllTables();
  if (!tables.includes("pengolahan_data_kepegawaian")) return;

  const tableDesc = await queryInterface.describeTable("pengolahan_data_kepegawaian");

  if (!tableDesc.status) {
    await queryInterface.addColumn("pengolahan_data_kepegawaian", "status", {
      type: Sequelize.STRING(32),
      allowNull: true,
      defaultValue: "draft",
    });
  }

  if (!tableDesc.verified_by) {
    await queryInterface.addColumn("pengolahan_data_kepegawaian", "verified_by", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  }

  if (!tableDesc.verified_at) {
    await queryInterface.addColumn("pengolahan_data_kepegawaian", "verified_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  }

  if (!tableDesc.notes) {
    await queryInterface.addColumn("pengolahan_data_kepegawaian", "notes", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  }
};

export const down = async (queryInterface) => {
  const tables = await queryInterface.showAllTables();
  if (!tables.includes("pengolahan_data_kepegawaian")) return;

  const tableDesc = await queryInterface.describeTable("pengolahan_data_kepegawaian");

  if (tableDesc.notes) await queryInterface.removeColumn("pengolahan_data_kepegawaian", "notes");
  if (tableDesc.verified_at) await queryInterface.removeColumn("pengolahan_data_kepegawaian", "verified_at");
  if (tableDesc.verified_by) await queryInterface.removeColumn("pengolahan_data_kepegawaian", "verified_by");
  if (tableDesc.status) await queryInterface.removeColumn("pengolahan_data_kepegawaian", "status");
};
