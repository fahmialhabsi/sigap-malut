import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const WorkflowInstance =
  sequelize.models.WorkflowInstance ||
  sequelize.define(
    "WorkflowInstance",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
        type: DataTypes.ENUM("active", "completed", "rejected"),
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
      timestamps: true,
      underscored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  );

export default WorkflowInstance;
