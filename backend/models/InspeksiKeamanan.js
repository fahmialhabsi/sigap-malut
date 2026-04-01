// M063: Inspeksi Keamanan Pangan
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const InspeksiKeamanan = sequelize.define(
  "InspeksiKeamanan",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nomor_inspeksi: { type: DataTypes.STRING(50) },
    tanggal_inspeksi: { type: DataTypes.DATEONLY, allowNull: false },
    lokasi: { type: DataTypes.STRING(255), allowNull: false },
    jenis_lokasi: { type: DataTypes.STRING(30) },
    kabupaten_kota: { type: DataTypes.STRING(100), allowNull: false },
    jenis_pangan: { type: DataTypes.STRING(255) },
    metode_inspeksi: { type: DataTypes.STRING(20), allowNull: false },
    temuan: { type: DataTypes.TEXT },
    status_temuan: { type: DataTypes.STRING(20), allowNull: false },
    rekomendasi: { type: DataTypes.TEXT },
    tindak_lanjut: { type: DataTypes.TEXT },
    foto_url: { type: DataTypes.STRING(500) },
    laporan_url: { type: DataTypes.STRING(500) },
    perlu_uji_lab: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    nomor_permintaan_uji: { type: DataTypes.STRING(50) },
    hasil_uji_uptd: { type: DataTypes.TEXT },
    catatan_revisi: { type: DataTypes.TEXT },
    status: { type: DataTypes.STRING(30), allowNull: false, defaultValue: "draft" },
    dilakukan_oleh: { type: DataTypes.INTEGER, allowNull: false },
    diverifikasi_oleh: { type: DataTypes.INTEGER },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "inspeksi_keamanan",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default InspeksiKeamanan;

