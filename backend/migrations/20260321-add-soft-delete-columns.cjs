/**
 * Migration: Add soft delete columns (is_deleted, deleted_at, deleted_by)
 * ke semua tabel data modul SIGAP-MALUT.
 *
 * Jalankan: npx sequelize-cli db:migrate
 * Rollback: npx sequelize-cli db:migrate:undo
 */

// Tabel yang perlu kolom soft delete
const TARGET_TABLES = [
  "komoditas",
  // BDS (Bidang Distribusi)
  "bds_bmb",
  "bds_cpd",
  "bds_evl",
  "bds_hrg",
  "bds_kbj",
  "bds_lap",
  "bds_mon",
  // BKS (Bidang Konsumsi)
  "bks_bmb",
  "bks_dvr",
  "bks_evl",
  "bks_kbj",
  "bks_kon",
  "bks_lap",
  "bks_pgd",
  "bks_pgn",
  // BKT (Bidang Ketersediaan)
  "bkt_kbj",
  "bkt_krw",
  "bkt_mev",
  "bkt_pgd",
  // SEK (Sekretariat)
  "sek_adm",
  "sek_ast",
  "sek_hum",
  "sek_kbj",
  "sek_kep",
  "sek_keu",
  "sek_lds",
  "sek_lks",
  "sek_lkt",
  "sek_ren",
  "sek_rmh",
  // UPTD
  "uptd_bmb",
  "uptd_dvr",
  "uptd_kbj",
  "uptd_krw",
  "uptd_lap",
  "uptd_mev",
  "uptd_pgd",
  "uptd_pgn",
  "uptd_ren",
  "uptd_spl",
  "uptd_stk",
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    for (const table of TARGET_TABLES) {
      // Cek apakah tabel ada sebelum alter
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

        // Tambah index untuk query performa
        try {
          await queryInterface.addIndex(table, ["is_deleted"], {
            name: `idx_${table}_is_deleted`,
          });
        } catch {
          // Index sudah ada, abaikan
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

        if (tableDesc.is_deleted) {
          await queryInterface.removeColumn(table, "is_deleted");
        }
        if (tableDesc.deleted_at) {
          await queryInterface.removeColumn(table, "deleted_at");
        }
        if (tableDesc.deleted_by) {
          await queryInterface.removeColumn(table, "deleted_by");
        }
        console.log(`↩️  Removed soft delete columns from: ${table}`);
      } catch (err) {
        if (!err.message?.includes("does not exist")) {
          console.error(`❌ Rollback error on ${table}: ${err.message}`);
        }
      }
    }
  },
};
