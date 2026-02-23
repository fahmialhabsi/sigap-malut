import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const ApprovalLog = sequelize.define(
  "ApprovalLog",
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
    approver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    approver_role: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    approval_level: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: "Soft delete timestamp",
    },
  },
  {
    tableName: "approval_log",
    timestamps: false,
    paranoid: true,
    deletedAt: "deleted_at",
  },
);

export default ApprovalLog;
