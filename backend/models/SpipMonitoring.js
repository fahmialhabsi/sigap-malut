import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const SpipMonitoring = sequelize.define(
  "SpipMonitoring",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    risk_id: { type: DataTypes.INTEGER, allowNull: false },
    jenis: {
      type: DataTypes.ENUM(
        "kegiatan_pengendalian",
        "peristiwa_risiko",
        "level_risiko",
        "efektivitas_pengendalian",
      ),
      allowNull: false,
    },
    tanggal: { type: DataTypes.DATEONLY, allowNull: false },
    uraian: { type: DataTypes.TEXT, allowNull: true },
    hasil: { type: DataTypes.TEXT, allowNull: true },
    nilai: { type: DataTypes.DECIMAL(12, 4), allowNull: true },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "spip_monitoring",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default SpipMonitoring;

