// backend/models/KerawananPangan.js — M036
// Peta kerawanan pangan per wilayah — skor multidimensi + status

import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const KerawananPangan = sequelize.define(
  "KerawananPangan",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    periode: { type: DataTypes.STRING(20), allowNull: false },
    kabupaten_kota: { type: DataTypes.STRING(100), allowNull: false },
    kecamatan: { type: DataTypes.STRING(100), allowNull: true },
    skor_kerawanan: { type: DataTypes.DECIMAL(5, 2), allowNull: true, comment: "0-100" },
    status_kerawanan: {
      type: DataTypes.ENUM("aman", "waspada", "rawan", "sangat_rawan"),
      allowNull: false,
      defaultValue: "aman",
    },
    // 4 aspek dari FSVA (Food Security and Vulnerability Atlas)
    aspek_stok: { type: DataTypes.DECIMAL(5, 2), allowNull: true, comment: "Ketersediaan fisik pangan" },
    aspek_akses: { type: DataTypes.DECIMAL(5, 2), allowNull: true, comment: "Kemampuan akses ekonomi" },
    aspek_pemanfaatan: { type: DataTypes.DECIMAL(5, 2), allowNull: true, comment: "Pemanfaatan pangan & gizi" },
    aspek_stabilitas: { type: DataTypes.DECIMAL(5, 2), allowNull: true, comment: "Stabilitas sepanjang waktu" },
    jumlah_penduduk_terdampak: { type: DataTypes.INTEGER, allowNull: true },
    catatan: { type: DataTypes.TEXT, allowNull: true },
    dokumen_url: { type: DataTypes.STRING(500), allowNull: true },
    diinput_oleh: { type: DataTypes.INTEGER, allowNull: false },
    diverifikasi_oleh: { type: DataTypes.INTEGER, allowNull: true },
    status_verifikasi: {
      type: DataTypes.ENUM("draft", "menunggu_verifikasi_jf", "dikembalikan_jf", "terverifikasi", "disetujui"),
      defaultValue: "draft",
    },
    deleted_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "kerawanan_pangan",
    timestamps: true,
    paranoid: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",
  }
);

export default KerawananPangan;
