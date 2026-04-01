// M066: Data UMKM Pangan
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const UmkmPangan = sequelize.define(
  "UmkmPangan",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nama_umkm: { type: DataTypes.STRING(255), allowNull: false },
    pemilik: { type: DataTypes.STRING(255), allowNull: false },
    jenis_produk: { type: DataTypes.STRING(255), allowNull: false },
    kabupaten_kota: { type: DataTypes.STRING(100), allowNull: false },
    alamat: { type: DataTypes.TEXT },
    no_telp: { type: DataTypes.STRING(20) },
    status_sertifikasi: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "belum" },
    jenis_sertifikasi: { type: DataTypes.STRING(100) },
    tanggal_sertifikasi: { type: DataTypes.DATEONLY },
    masa_berlaku_sertifikasi: { type: DataTypes.DATEONLY },
    status_binaan: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "aktif" },
    diinput_oleh: { type: DataTypes.INTEGER, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "umkm_pangan",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default UmkmPangan;

