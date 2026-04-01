// M059: Realisasi Distribusi SPPG Bulanan
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const SppgDistribusi = sequelize.define(
  "SppgDistribusi",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    // Postgres tidak punya tipe TINYINT → gunakan SMALLINT (cukup untuk 1–12)
    periode_bulan: { type: DataTypes.SMALLINT, allowNull: false },
    periode_tahun: { type: DataTypes.INTEGER, allowNull: false },
    sppg_penerima_id: { type: DataTypes.INTEGER, allowNull: false },
    jumlah_penerima_terealisasi: { type: DataTypes.INTEGER },
    komoditas_distribusi: { type: DataTypes.TEXT }, // JSON string
    tanggal_distribusi: { type: DataTypes.DATEONLY },
    status_distribusi: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "belum" },
    catatan: { type: DataTypes.TEXT },
    catatan_revisi: { type: DataTypes.TEXT },
    diinput_oleh: { type: DataTypes.INTEGER, allowNull: false },
    diverifikasi_oleh: { type: DataTypes.INTEGER },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "sppg_distribusi",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default SppgDistribusi;

