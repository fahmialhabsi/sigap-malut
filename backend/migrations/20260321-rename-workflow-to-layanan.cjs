// Migration: Rename workflow_id to layanan_id in approval_log

"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn(
      "approval_log",
      "workflow_id",
      "layanan_id",
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn(
      "approval_log",
      "layanan_id",
      "workflow_id",
    );
  },
};
