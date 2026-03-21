// Migration: Safely convert approval_log.id from INTEGER to UUID

"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Tambah kolom id_baru UUID
    await queryInterface.addColumn("approval_log", "id_baru", {
      type: Sequelize.UUID,
      allowNull: false,
      defaultValue: Sequelize.literal("gen_random_uuid()"),
    });
    // 2. Copy data id lama ke kolom baru (optional, jika ingin mapping lama ke baru)
    // 3. Hapus PK lama, set id_baru sebagai PK
    await queryInterface.sequelize.query(
      "ALTER TABLE approval_log DROP CONSTRAINT approval_log_pkey",
    );
    await queryInterface.changeColumn("approval_log", "id_baru", {
      type: Sequelize.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: Sequelize.literal("gen_random_uuid()"),
    });
    // 4. Hapus kolom id lama
    await queryInterface.removeColumn("approval_log", "id");
    // 5. Rename id_baru ke id
    await queryInterface.renameColumn("approval_log", "id_baru", "id");
  },

  async down(queryInterface, Sequelize) {
    // Tidak implementasi down detail, karena perubahan destruktif
  },
};
