"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("workflow_instance", "domain_sequence", {
      type: Sequelize.JSON,
      allowNull: true,
    });
    await queryInterface.addColumn("workflow_instance", "current_domain", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("workflow_instance", "current_agency", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("workflow_instance", "current_step_index", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn("workflow_instance", "current_state", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "draft",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("workflow_instance", "domain_sequence");
    await queryInterface.removeColumn("workflow_instance", "current_domain");
    await queryInterface.removeColumn("workflow_instance", "current_agency");
    await queryInterface.removeColumn("workflow_instance", "current_step_index");
    await queryInterface.removeColumn("workflow_instance", "current_state");
  },
};