import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const ApprovalWorkflow = sequelize.define(
  "ApprovalWorkflow",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    modul_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    record_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unit_kerja: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    current_level: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    total_levels: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    current_role: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    next_role: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "pending",
    },
    submitted_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    submitted_at: {
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
    tableName: "approval_workflow",
    timestamps: false,
    paranoid: true,
    deletedAt: "deleted_at",
  },
);

export default ApprovalWorkflow;
