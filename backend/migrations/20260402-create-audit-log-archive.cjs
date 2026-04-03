/** @param {import('sequelize').QueryInterface} queryInterface */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("audit_log_archive", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      original_audit_log_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      modul: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      entitas_id: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      aksi: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      data_lama: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      data_baru: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      pegawai_id: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      source_created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      archived_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
    // createTable IF NOT EXISTS + indeks dari sync → addIndex bisa duplikat; pakai IF NOT EXISTS.
    const idx = [
      `CREATE INDEX IF NOT EXISTS "audit_log_archive_modul_idx" ON "audit_log_archive" ("modul");`,
      `CREATE INDEX IF NOT EXISTS "audit_log_archive_archived_at_idx" ON "audit_log_archive" ("archived_at");`,
      `CREATE INDEX IF NOT EXISTS "audit_log_archive_source_created_at_idx" ON "audit_log_archive" ("source_created_at");`,
    ];
    for (const sql of idx) {
      await queryInterface.sequelize.query(sql);
    }
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("audit_log_archive");
  },
};
