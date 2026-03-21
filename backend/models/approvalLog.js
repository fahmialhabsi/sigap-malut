import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const ApprovalLog = sequelize.define(
  "ApprovalLog",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    layanan_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    reviewer_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    action: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    catatan: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "approval_log",
    timestamps: false,
  },
);

export default ApprovalLog;
