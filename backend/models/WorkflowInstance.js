// backend/models/WorkflowInstance.js
const { DataTypes } = require("sequelize");
const sequelize = require("../database"); // adjust path if needed

const WorkflowInstance = sequelize.define(
  "WorkflowInstance",
  {
    // ...existing fields...
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
  },
  {
    tableName: "workflow_instance",
    underscored: true,
    timestamps: true,
  }
);

module.exports = WorkflowInstance;