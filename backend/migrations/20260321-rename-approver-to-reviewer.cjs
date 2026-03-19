// Migration: Rename approver_id to reviewer_id in approval_log

"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn(
      "approval_log",
      "approver_id",
      "reviewer_id",
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn(
      "approval_log",
      "reviewer_id",
      "approver_id",
    );
  },
};
