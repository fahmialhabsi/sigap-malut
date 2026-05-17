"use strict";

/**
 * PostgreSQL: unique partial index — satu baris approved per (from,to,old_sub).
 * MySQL/SQLite: andalkan hook model + assertNoDuplicateApprovedMappings (lihat migrationTransactionGovernance.js).
 */
module.exports = {
  async up(queryInterface) {
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect !== "postgres") {
      console.log("[mapping-approved-unique-partial-pg] Skip: bukan PostgreSQL.");
      return;
    }
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uq_mapping_sub_approved_old_unique
      ON mapping_sub_kegiatan (regulasi_versi_from_id, regulasi_versi_to_id, old_master_sub_kegiatan_id)
      WHERE status = 'approved';
    `);
  },

  async down(queryInterface) {
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect !== "postgres") return;
    await queryInterface.sequelize.query(
      `DROP INDEX IF EXISTS uq_mapping_sub_approved_old_unique;`,
    );
  },
};
