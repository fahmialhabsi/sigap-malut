import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Approval = sequelize.define(
  "Approval",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    task_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    approver_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    approver_role: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "rejected", "revised"),
      allowNull: false,
      defaultValue: "pending",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    decided_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "approvals",
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default Approval;
