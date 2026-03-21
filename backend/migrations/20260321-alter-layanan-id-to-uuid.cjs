// Migration: Alter layanan_id in approval_log from INTEGER to UUID

"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop FK constraint if exists (ignore error if not found)
    try {
      await queryInterface.removeConstraint(
        "approval_log",
        "approval_log_layanan_id_fkey",
      );
    } catch (e) {}
    // Alter column type
    await queryInterface.changeColumn("approval_log", "layanan_id", {
      type: Sequelize.UUID,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    // Down migration: change back to INTEGER (data loss risk)
    await queryInterface.changeColumn("approval_log", "layanan_id", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};
