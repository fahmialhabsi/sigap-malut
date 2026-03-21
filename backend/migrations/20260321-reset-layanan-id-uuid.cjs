// Migration: Drop layanan_id INTEGER, add layanan_id UUID (clean reset)

"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Drop kolom layanan_id lama
    await queryInterface.removeColumn("approval_log", "layanan_id");
    // 2. Tambah kolom layanan_id baru bertipe UUID
    await queryInterface.addColumn("approval_log", "layanan_id", {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: "layanan", key: "id_layanan" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },

  async down(queryInterface, Sequelize) {
    // Down: drop UUID, tambah INTEGER (data loss risk)
    await queryInterface.removeColumn("approval_log", "layanan_id");
    await queryInterface.addColumn("approval_log", "layanan_id", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};
