// backend/models/WorkflowInstance.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const WorkflowInstance = sequelize.define(
  "WorkflowInstance",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    module_id: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    entity_id: {
      type: DataTypes.STRING(128),
      allowNull: true,
    },
    current_state: {
      type: DataTypes.STRING(64),
      allowNull: false,
      defaultValue: "draft",
    },
    status: {
      type: DataTypes.STRING, // gunakan ENUM jika enum di DB
      allowNull: false,
      defaultValue: "active",
    },
    current_role: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    next_role: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    submitted_by: {
      type: DataTypes.STRING(128),
      allowNull: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    closed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    domain_sequence: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    current_domain: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    current_agency: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    current_step_index: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "workflow_instance",
    underscored: true,
    timestamps: false, // karena created_at dan updated_at sudah didefinisikan manual
  },
);

export default WorkflowInstance;
