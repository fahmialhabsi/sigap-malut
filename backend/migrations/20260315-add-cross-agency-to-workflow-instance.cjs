"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Kolom 'domain_sequence' sudah ada, tidak perlu ditambah lagi
    // await queryInterface.addColumn("workflow_instance", "domain_sequence", {
    //   type: Sequelize.JSON,
    //   allowNull: true,
    // });
    // Kolom-kolom sudah ada, tidak perlu ditambah lagi
    // await queryInterface.addColumn("workflow_instance", "current_domain", {
    //   type: Sequelize.STRING,
    //   allowNull: true,
    // });
    // await queryInterface.addColumn("workflow_instance", "current_agency", {
    //   type: Sequelize.STRING,
    //   allowNull: true,
    // });
    // await queryInterface.addColumn("workflow_instance", "current_step_index", {
    //   type: Sequelize.INTEGER,
    //   allowNull: false,
    //   defaultValue: 0,
    // });
    // await queryInterface.addColumn("workflow_instance", "current_state", {
    //   type: Sequelize.STRING,
    //   allowNull: false,
    //   defaultValue: "draft",
    // });
  },

  down: async (queryInterface, Sequelize) => {
    // Jangan hapus kolom 'domain_sequence'
    // await queryInterface.removeColumn("workflow_instance", "domain_sequence");
    // Jangan hapus kolom-kolom ini
    // await queryInterface.removeColumn("workflow_instance", "current_domain");
    // await queryInterface.removeColumn("workflow_instance", "current_agency");
    // await queryInterface.removeColumn("workflow_instance", "current_step_index");
    // await queryInterface.removeColumn("workflow_instance", "current_state");
  },
};
