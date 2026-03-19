// Migration: Update approval_log to use UUID and match dokumenSistem

"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Ubah kolom id, reviewer_id, layanan_id ke UUID
    await queryInterface.changeColumn("approval_log", "id", {
      type: Sequelize.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: Sequelize.literal("gen_random_uuid()"),
    });
    await queryInterface.changeColumn("approval_log", "reviewer_id", {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
    await queryInterface.changeColumn("approval_log", "layanan_id", {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: "layanan", key: "id_layanan" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
    // 2. Rename kolom jika perlu
    //     await queryInterface.renameColumn("approval_log", "notes", "catatan");
    // await queryInterface.renameColumn(
    //   "approval_log",
    //   "created_at",
    //   "timestamp",
    // );
    // 3. Hapus kolom yang tidak ada di dokumenSistem
    // await queryInterface.removeColumn("approval_log", "workflow_id");
    // await queryInterface.removeColumn("approval_log", "approver_id");
    await queryInterface.removeColumn("approval_log", "approver_role");
    await queryInterface.removeColumn("approval_log", "approval_level");
    await queryInterface.removeColumn("approval_log", "deleted_at");
  },

  async down(queryInterface, Sequelize) {
    // Tidak implementasi down detail, karena perubahan destruktif
    // (restore kolom lama jika perlu manual)
  },
};
