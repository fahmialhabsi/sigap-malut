// backend/models/ProduksiPangan.js — M033
// Data produksi pangan per komoditas per kabupaten (input Pelaksana, verifikasi JF)

import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const ProduksiPangan = sequelize.define(
  "ProduksiPangan",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    periode_bulan: { type: DataTypes.SMALLINT, allowNull: false, validate: { min: 1, max: 12 } },
    periode_tahun: { type: DataTypes.SMALLINT, allowNull: false },
    kabupaten_kota: { type: DataTypes.STRING(100), allowNull: false },
    komoditas_id: { type: DataTypes.INTEGER, allowNull: false },
    volume_produksi: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    satuan: { type: DataTypes.STRING(20), defaultValue: "ton" },
    sumber_data: {
      type: DataTypes.ENUM("survei_lapangan", "dinas_pertanian", "bps", "estimasi"),
      allowNull: false,
      defaultValue: "survei_lapangan",
    },
    tanggal_survei: { type: DataTypes.DATEONLY, allowNull: true },
    catatan: { type: DataTypes.TEXT, allowNull: true },
    dokumen_url: { type: DataTypes.STRING(500), allowNull: true },
    diinput_oleh: { type: DataTypes.INTEGER, allowNull: false },
    diverifikasi_oleh: { type: DataTypes.INTEGER, allowNull: true },
    status: {
      type: DataTypes.ENUM("draft", "menunggu_verifikasi_jf", "dikembalikan_jf", "terverifikasi", "disetujui"),
      defaultValue: "draft",
    },
    catatan_verifikasi: { type: DataTypes.TEXT, allowNull: true },
    deleted_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "produksi_pangan",
    timestamps: true,
    paranoid: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
  }
);

export default ProduksiPangan;
