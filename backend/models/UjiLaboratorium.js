import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const UjiLaboratorium = sequelize.define("UjiLaboratorium", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nomor_order: { type: DataTypes.STRING(50), unique: true, allowNull: false },
  tanggal_terima: { type: DataTypes.DATEONLY, allowNull: false },
  asal_permintaan: { type: DataTypes.STRING(50), defaultValue: "internal_uptd" },
  ref_koordinasi_id: { type: DataTypes.INTEGER, allowNull: true },
  nama_pemohon: { type: DataTypes.STRING(255), allowNull: false },
  jenis_sampel: { type: DataTypes.STRING(255), allowNull: false },
  deskripsi_sampel: { type: DataTypes.TEXT, allowNull: true },
  jumlah_sampel: { type: DataTypes.INTEGER, defaultValue: 1 },
  jenis_uji: { type: DataTypes.STRING(100), allowNull: false },
  prioritas: { type: DataTypes.STRING(20), defaultValue: "normal" },
  status: { type: DataTypes.STRING(20), defaultValue: "menunggu" },
  tanggal_mulai: { type: DataTypes.DATEONLY, allowNull: true },
  tanggal_target: { type: DataTypes.DATEONLY, allowNull: true },
  tanggal_selesai: { type: DataTypes.DATEONLY, allowNull: true },
  ditugaskan_kasi_id: { type: DataTypes.INTEGER, allowNull: true },
  ditugaskan_jf_id: { type: DataTypes.INTEGER, allowNull: true },
  laporan_url: { type: DataTypes.STRING(500), allowNull: true },
  diterima_oleh: { type: DataTypes.INTEGER, allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: "uji_laboratorium",
  timestamps: false,
});

export default UjiLaboratorium;
