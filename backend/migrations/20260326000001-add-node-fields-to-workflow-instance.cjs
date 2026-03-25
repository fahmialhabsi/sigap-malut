"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tableDescription =
      await queryInterface.describeTable("workflow_instance");

    if (!tableDescription.current_node_id) {
      await queryInterface.addColumn("workflow_instance", "current_node_id", {
        type: Sequelize.STRING(128),
        allowNull: true,
        after: "current_step_index",
      });
    }

    if (!tableDescription.unit_kerja) {
      await queryInterface.addColumn("workflow_instance", "unit_kerja", {
        type: Sequelize.STRING(255),
        allowNull: true,
        after: "current_node_id",
      });
    }
  },

  async down(queryInterface) {
    const tableDescription =
      await queryInterface.describeTable("workflow_instance");

    if (tableDescription.current_node_id) {
      await queryInterface.removeColumn("workflow_instance", "current_node_id");
    }
    if (tableDescription.unit_kerja) {
      await queryInterface.removeColumn("workflow_instance", "unit_kerja");
    }
  },
};
