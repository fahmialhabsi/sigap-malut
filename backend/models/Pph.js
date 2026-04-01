// M057: Pola Pangan Harapan (PPH)
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Pph = sequelize.define(
  "Pph",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    periode_tahun: { type: DataTypes.INTEGER, allowNull: false },
    kabupaten_kota: { type: DataTypes.STRING(100), allowNull: false },
    skor_pph: { type: DataTypes.DECIMAL(6, 2) },
    skor_energi: { type: DataTypes.DECIMAL(6, 2) },
    skor_protein: { type: DataTypes.DECIMAL(6, 2) },
    analisa: { type: DataTypes.TEXT },
    rekomendasi: { type: DataTypes.TEXT },
    dibuat_oleh: { type: DataTypes.INTEGER, allowNull: false },
    disetujui_oleh: { type: DataTypes.INTEGER },
    status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "draft" },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "pph",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default Pph;

