import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Approval =
  sequelize.models.Approval ||
  sequelize.define(
    "Approval",
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
        type: DataTypes.STRING,
        allowNull: false,
      },
      approver_user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      decision: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        allowNull: false,
        defaultValue: "pending",
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      decided_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "Approvals",
      timestamps: false,
      underscored: true,
    },
  );

export default Approval;
