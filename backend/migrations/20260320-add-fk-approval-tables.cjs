// Migration: Add FK constraints to approval_workflow and approval_log

"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add FK to users (submitted_by) in approval_workflow
    await queryInterface.addConstraint("approval_workflow", {
      fields: ["submitted_by"],
      type: "foreign key",
      name: "fk_approval_workflow_submitted_by_users",
      references: {
        table: "users",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    // Add FK to users (approver_id) in approval_log
    await queryInterface.addConstraint("approval_log", {
      fields: ["approver_id"],
      type: "foreign key",
      name: "fk_approval_log_approver_id_users",
      references: {
        table: "users",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    // Add FK to approval_workflow (workflow_id) in approval_log
    await queryInterface.addConstraint("approval_log", {
      fields: ["workflow_id"],
      type: "foreign key",
      name: "fk_approval_log_workflow_id_approval_workflow",
      references: {
        table: "approval_workflow",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "approval_workflow",
      "fk_approval_workflow_submitted_by_users",
    );
    await queryInterface.removeConstraint(
      "approval_log",
      "fk_approval_log_approver_id_users",
    );
    await queryInterface.removeConstraint(
      "approval_log",
      "fk_approval_log_workflow_id_approval_workflow",
    );
  },
};
