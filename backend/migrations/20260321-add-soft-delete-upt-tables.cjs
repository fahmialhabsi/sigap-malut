/**
 * Migration: Add soft delete columns ke tabel UPTD (UPT) dan BKS yang terlewat
 * karena nama tabel salah di migrasi sebelumnya.
 *
 * Nama tabel benar: upt_adm, upt_ast, upt_ins, upt_kep, upt_keu, upt_mtu, upt_tkn
 * Bukan: uptd_bmb, uptd_dvr, dll.
 */

const TARGET_TABLES = [
  // UPT (bukan UPTD — sesuai tableName di models)
  "upt_adm",
  "upt_ast",
  "upt_ins",
  "upt_kep",
  "upt_keu",
  "upt_mtu",
  "upt_tkn",
  // BKT yang mungkin terlewat
  "bkt_bmb",
  "bkt_fsl",
  // BKS kmn (sudah ada bks_bmb, bks_dvr, bks_evl, bks_kbj, bks_lap dari migrasi pertama)
  "bks_kmn",
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    for (const table of TARGET_TABLES) {
      try {
        const tableDesc = await queryInterface.describeTable(table);

        if (!tableDesc.is_deleted) {
          await queryInterface.addColumn(table, "is_deleted", {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: "Soft delete flag. TRUE = data dihapus secara logis.",
          });
        }

        if (!tableDesc.deleted_at) {
          await queryInterface.addColumn(table, "deleted_at", {
            type: Sequelize.DATE,
            allowNull: true,
            comment: "Timestamp saat data dihapus secara logis.",
          });
        }

        if (!tableDesc.deleted_by) {
          await queryInterface.addColumn(table, "deleted_by", {
            type: Sequelize.INTEGER,
            allowNull: true,
            comment: "ID user yang melakukan soft delete.",
          });
        }

        try {
          await queryInterface.addIndex(table, ["is_deleted"], {
            name: `idx_${table}_is_deleted`,
          });
        } catch {
          // Index sudah ada
        }

        console.log(`✅ Added soft delete columns to: ${table}`);
      } catch (err) {
        if (err.message && err.message.includes("does not exist")) {
          console.log(`⚠️  Table ${table} not found, skipping.`);
        } else {
          console.error(`❌ Error on ${table}: ${err.message}`);
        }
      }
    }
  },

  down: async (queryInterface) => {
    for (const table of TARGET_TABLES) {
      try {
        const tableDesc = await queryInterface.describeTable(table);
        if (tableDesc.is_deleted)
          await queryInterface.removeColumn(table, "is_deleted");
        if (tableDesc.deleted_at)
          await queryInterface.removeColumn(table, "deleted_at");
        if (tableDesc.deleted_by)
          await queryInterface.removeColumn(table, "deleted_by");
        console.log(`↩️  Removed soft delete columns from: ${table}`);
      } catch (err) {
        if (!err.message?.includes("does not exist")) {
          console.error(`❌ Rollback error on ${table}: ${err.message}`);
        }
      }
    }
  },
};
