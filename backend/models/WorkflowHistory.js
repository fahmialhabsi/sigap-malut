// backend/models/WorkflowHistory.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const WorkflowHistory = sequelize.define(
  "WorkflowHistory",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    workflow_instance_id: {
      type: DataTypes.INTEGER,
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
    from_state: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    to_state: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    actor_id: {
      type: DataTypes.STRING(128),
      allowNull: true,
    },
    actor_role: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    payload: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "workflow_history",
    underscored: true,
    timestamps: false, // karena created_at sudah didefinisikan manual
  },
);

export default WorkflowHistory;
