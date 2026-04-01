// M064: Data Keracunan Pangan
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const KeracunanPangan = sequelize.define(
  "KeracunanPangan",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nomor_kasus: { type: DataTypes.STRING(50) },
    tanggal_kejadian: { type: DataTypes.DATE, allowNull: false },
    lokasi: { type: DataTypes.STRING(255), allowNull: false },
    kabupaten_kota: { type: DataTypes.STRING(100), allowNull: false },
    jumlah_korban: { type: DataTypes.INTEGER, allowNull: false },
    jumlah_rawat: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    dugaan_penyebab: { type: DataTypes.TEXT },
    sumber_laporan: { type: DataTypes.STRING(30), allowNull: false },
    status: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "baru" },
    sampel_diambil: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    tanggal_ambil_sampel: { type: DataTypes.DATEONLY },
    hasil_uji_lab: { type: DataTypes.TEXT },
    intervensi: { type: DataTypes.TEXT },
    koordinasi_bpom: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    laporan_url: { type: DataTypes.STRING(500) },
    ditangani_oleh: { type: DataTypes.INTEGER, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "keracunan_pangan",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default KeracunanPangan;

