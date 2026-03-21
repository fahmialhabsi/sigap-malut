"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("workflows", {
      id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      institution_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      definition: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      current_step: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "draft",
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      created_by: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "RESTRICT",
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.createTable("workflow_transition_logs", {
      id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
      },
      workflow_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "workflows",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      from_step: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      to_step: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      actor_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "RESTRICT",
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("workflow_transition_logs");
    await queryInterface.dropTable("workflows");
  },
};
