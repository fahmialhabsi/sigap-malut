import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const TaskApproval = sequelize.define(
  "TaskApproval",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    task_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    approver_role: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    approver_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    decision: {
      type: DataTypes.STRING(20),
      allowNull: true,
      validate: {
        isIn: [["approved", "rejected", "revision", "closed"]],
      },
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    decided_at: {
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
    tableName: "task_approvals",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default TaskApproval;
