export const up = async (queryInterface, Sequelize) => {
  const dialect =
    typeof queryInterface.sequelize.getDialect === "function"
      ? queryInterface.sequelize.getDialect()
      : null;

  // helper: check table exists for sqlite/postgres
  async function tableExists(tableName) {
    if (dialect === "postgres") {
      const res = await queryInterface.sequelize.query(
        `SELECT to_regclass('${tableName}') as reg`,
      );
      return (
        Array.isArray(res) && res[0] && res[0][0] && res[0][0].reg !== null
      );
    } else if (dialect === "sqlite") {
      const res = await queryInterface.sequelize.query(
        `SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}';`,
      );
      return Array.isArray(res) && res[0] && res[0].length > 0;
    }
    // fallback
    try {
      await queryInterface.sequelize.query(
        `SELECT 1 FROM ${tableName} LIMIT 1;`,
      );
      return true;
    } catch (e) {
      return false;
    }
  }

  if (await tableExists("pengelolaan_data_kepegawaian")) {
    return;
  }

  const columns = {
    id:
      dialect === "postgres"
        ? {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.literal("gen_random_uuid()"),
          }
        : {
            type: Sequelize.UUID,
            primaryKey: true,
            defaultValue: Sequelize.UUIDV4,
          },
    // minimal base columns; add more if needed later via existing add-columns migration
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  };

  await queryInterface.createTable("pengelolaan_data_kepegawaian", columns);
};

export const down = async (queryInterface) => {
  await queryInterface
    .dropTable("pengelolaan_data_kepegawaian")
    .catch(() => {});
};
