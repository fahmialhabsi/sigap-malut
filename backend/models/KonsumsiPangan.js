// M056: Data Konsumsi Pangan (basis perhitungan PPH)
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const KonsumsiPangan = sequelize.define(
  "KonsumsiPangan",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    periode_tahun: { type: DataTypes.INTEGER, allowNull: false },
    kabupaten_kota: { type: DataTypes.STRING(100), allowNull: false },
    kelompok_pangan: { type: DataTypes.STRING(30), allowNull: false },
    konsumsi_gram_per_kapita: { type: DataTypes.DECIMAL(10, 2) },
    sumber_data: { type: DataTypes.STRING(30), allowNull: false, defaultValue: "bps_susenas" },
    diinput_oleh: { type: DataTypes.INTEGER, allowNull: false },
    diverifikasi_oleh: { type: DataTypes.INTEGER },
    catatan_revisi: { type: DataTypes.TEXT },
    status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "draft" },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "konsumsi_pangan",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default KonsumsiPangan;

