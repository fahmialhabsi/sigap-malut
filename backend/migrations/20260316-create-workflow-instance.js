import { DataTypes } from "sequelize";

/**
 * Migration for creating workflow_instance table
 * Run with: npx sequelize-cli db:migrate
 */

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("workflow_instance", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    domain_sequence: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    current_domain: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    current_agency: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    current_step_index: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    current_state: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "draft",
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("workflow_instance");
}
