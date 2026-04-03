import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const SpipRiskRegister = sequelize.define(
  "SpipRiskRegister",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    unit_kerja: { type: DataTypes.STRING(40), allowNull: false },
    periode_tahun: { type: DataTypes.INTEGER, allowNull: true },
    kode_risiko: { type: DataTypes.STRING(50), allowNull: true },
    nama_risiko: { type: DataTypes.TEXT, allowNull: false },
    kategori_risiko: { type: DataTypes.STRING(120), allowNull: true },
    sasaran_konteks: { type: DataTypes.TEXT, allowNull: true },
    proses_bisnis_konteks: { type: DataTypes.TEXT, allowNull: true },
    pemilik_risiko: { type: DataTypes.STRING(160), allowNull: true },
    status: {
      type: DataTypes.ENUM("draft", "active", "closed"),
      allowNull: false,
      defaultValue: "active",
    },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "spip_risk_register",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default SpipRiskRegister;

