"use strict";

/** Jejak apply mapping ke transaksi + rollback. */

async function tableExists(qi, name) {
  const tables = await qi.showAllTables();
  return tables.map((t) => String(t).toLowerCase()).includes(String(name).toLowerCase());
}

module.exports = {
  async up(queryInterface, Sequelize) {
    if (!(await tableExists(queryInterface, "migration_transaction_apply_batch"))) {
      await queryInterface.createTable("migration_transaction_apply_batch", {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        regulasi_versi_from_id: { type: Sequelize.INTEGER, allowNull: false },
        regulasi_versi_to_id: { type: Sequelize.INTEGER, allowNull: false },
        applied_by_user_id: { type: Sequelize.INTEGER, allowNull: true },
        status: { type: Sequelize.STRING(24), allowNull: false, defaultValue: "applied" },
        row_count: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
        note: { type: Sequelize.TEXT, allowNull: true },
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
      });
    }

    if (!(await tableExists(queryInterface, "migration_transaction_apply_log"))) {
      await queryInterface.createTable("migration_transaction_apply_log", {
        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
        batch_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: "migration_transaction_apply_batch", key: "id" },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        table_name: { type: Sequelize.STRING(64), allowNull: false },
        row_pk: { type: Sequelize.INTEGER, allowNull: false },
        mapping_sub_kegiatan_id: { type: Sequelize.INTEGER, allowNull: true },
        old_master_program_id: { type: Sequelize.INTEGER, allowNull: true },
        old_master_kegiatan_id: { type: Sequelize.INTEGER, allowNull: true },
        old_master_sub_kegiatan_id: { type: Sequelize.INTEGER, allowNull: true },
        new_master_program_id: { type: Sequelize.INTEGER, allowNull: true },
        new_master_kegiatan_id: { type: Sequelize.INTEGER, allowNull: true },
        new_master_sub_kegiatan_id: { type: Sequelize.INTEGER, allowNull: true },
        rolled_back_at: { type: Sequelize.DATE, allowNull: true },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
      });
      await queryInterface.addIndex("migration_transaction_apply_log", ["batch_id"], {
        name: "idx_mig_tx_log_batch",
      });
    }
  },

  async down(queryInterface) {
    if (await tableExists(queryInterface, "migration_transaction_apply_log")) {
      await queryInterface.dropTable("migration_transaction_apply_log");
    }
    if (await tableExists(queryInterface, "migration_transaction_apply_batch")) {
      await queryInterface.dropTable("migration_transaction_apply_batch");
    }
  },
};
