import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const BypassDetection = sequelize.define(
  "BypassDetection",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    workflow_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_role: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    bypassed_level: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    attempted_action: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    detected_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    severity: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "high",
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Soft delete timestamp",
    },
  },
  {
    tableName: "bypass_detection",
    timestamps: false,
    paranoid: true,
    deletedAt: "deleted_at",
  },
);

export default BypassDetection;
