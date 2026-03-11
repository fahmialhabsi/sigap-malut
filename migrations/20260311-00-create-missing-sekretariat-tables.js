export const up = async (queryInterface, Sequelize) => {
  const dialect =
    typeof queryInterface.sequelize.getDialect === "function"
      ? queryInterface.sequelize.getDialect()
      : null;

  // helper: check if table exists (cross-dialect: sqlite, postgres, fallback)
  async function tableExists(tableName) {
    if (dialect === "sqlite" || dialect === "mssql") {
      const res = await queryInterface.sequelize.query(
        `SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}';`,
      );
      return Array.isArray(res) && res[0] && res[0].length > 0;
    } else if (dialect === "postgres") {
      const res = await queryInterface.sequelize.query(
        `SELECT to_regclass('${tableName}')`,
      );
      return (
        Array.isArray(res) &&
        res[0] &&
        res[0][0] &&
        res[0][0].to_regclass !== null
      );
    } else {
      try {
        await queryInterface.sequelize.query(
          `SELECT 1 FROM ${tableName} LIMIT 1;`,
        );
        return true;
      } catch (e) {
        return false;
      }
    }
  }

  // Create minimal tables only if missing. Minimal columns so subsequent migrations that add columns can run.
  if (!(await tableExists("data_induk_asn"))) {
    await queryInterface.createTable("data_induk_asn", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    });
  }

  if (!(await tableExists("penghargaan"))) {
    await queryInterface.createTable("penghargaan", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    });
  }

  if (!(await tableExists("pelatihan_pengolahan_pangan_lokal"))) {
    await queryInterface.createTable("pelatihan_pengolahan_pangan_lokal", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    });
  }

  if (!(await tableExists("pengolahan_data_kepegawaian"))) {
    await queryInterface.createTable("pengolahan_data_kepegawaian", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    });
  }
};

export const down = async (queryInterface) => {
  // safe down: drop only if exist (Sequelize will ignore if not exist)
  await queryInterface.dropTable("data_induk_asn").catch(() => {});
  await queryInterface.dropTable("penghargaan").catch(() => {});
  await queryInterface
    .dropTable("pelatihan_pengolahan_pangan_lokal")
    .catch(() => {});
  await queryInterface.dropTable("pengolahan_data_kepegawaian").catch(() => {});
};
