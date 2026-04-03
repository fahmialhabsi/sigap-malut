import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const SpipRtp = sequelize.define(
  "SpipRtp",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    risk_id: { type: DataTypes.INTEGER, allowNull: false },
    uraian_rtp: { type: DataTypes.TEXT, allowNull: false },
    penanggung_jawab: { type: DataTypes.STRING(160), allowNull: true },
    target_tanggal: { type: DataTypes.DATEONLY, allowNull: true },
    status: {
      type: DataTypes.ENUM("planned", "in_progress", "done", "blocked", "cancelled"),
      allowNull: false,
      defaultValue: "planned",
    },
    realized_at: { type: DataTypes.DATE, allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "spip_rtp",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default SpipRtp;

