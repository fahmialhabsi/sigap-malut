// M058: Data Penerima SPPG
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const SppgPenerima = sequelize.define(
  "SppgPenerima",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    kabupaten_kota: { type: DataTypes.STRING(100), allowNull: false },
    kecamatan: { type: DataTypes.STRING(100) },
    nama_satuan: { type: DataTypes.STRING(255), allowNull: false },
    jenis_satuan: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "sekolah" },
    jumlah_penerima: { type: DataTypes.INTEGER, allowNull: false },
    koordinat_lat: { type: DataTypes.DECIMAL(10, 7) },
    koordinat_lng: { type: DataTypes.DECIMAL(10, 7) },
    status_aktif: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    tanggal_daftar: { type: DataTypes.DATEONLY, allowNull: false },
    diinput_oleh: { type: DataTypes.INTEGER, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "sppg_penerima",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default SppgPenerima;

