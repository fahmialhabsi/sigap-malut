// backend/models/StokPangan.js — M034
// Stok pangan di gudang per komoditas per kabupaten

import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const StokPangan = sequelize.define(
  "StokPangan",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tanggal_update: { type: DataTypes.DATEONLY, allowNull: false },
    lokasi_gudang: { type: DataTypes.STRING(255), allowNull: false },
    kabupaten_kota: { type: DataTypes.STRING(100), allowNull: false },
    komoditas_id: { type: DataTypes.INTEGER, allowNull: false },
    volume_stok: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    satuan: { type: DataTypes.STRING(20), defaultValue: "ton" },
    estimasi_hari: { type: DataTypes.INTEGER, allowNull: true, comment: "Cukup untuk berapa hari" },
    status_stok: {
      type: DataTypes.ENUM("aman", "waspada", "kritis"),
      defaultValue: "aman",
    },
    catatan: { type: DataTypes.TEXT, allowNull: true },
    dokumen_url: { type: DataTypes.STRING(500), allowNull: true },
    diinput_oleh: { type: DataTypes.INTEGER, allowNull: false },
    diverifikasi_oleh: { type: DataTypes.INTEGER, allowNull: true },
    status_verifikasi: {
      type: DataTypes.ENUM("draft", "menunggu_verifikasi_jf", "dikembalikan_jf", "terverifikasi"),
      defaultValue: "draft",
    },
    catatan_verifikasi: { type: DataTypes.TEXT, allowNull: true },
    deleted_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "stok_pangan",
    timestamps: true,
    paranoid: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
  }
);

export default StokPangan;
