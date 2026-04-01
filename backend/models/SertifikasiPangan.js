import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const SertifikasiPangan = sequelize.define("SertifikasiPangan", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nomor_sertifikat: { type: DataTypes.STRING(50), unique: true, allowNull: true },
  jenis_sertifikasi: { type: DataTypes.STRING(20), allowNull: false },
  nama_pemohon: { type: DataTypes.STRING(255), allowNull: false },
  jenis_usaha: { type: DataTypes.STRING(255), allowNull: true },
  alamat_usaha: { type: DataTypes.TEXT, allowNull: true },
  produk_pangan: { type: DataTypes.STRING(255), allowNull: true },
  status: { type: DataTypes.STRING(30), defaultValue: "permohonan_masuk" },
  tanggal_permohonan: { type: DataTypes.DATEONLY, allowNull: false },
  tanggal_terbit: { type: DataTypes.DATEONLY, allowNull: true },
  tanggal_kadaluwarsa: { type: DataTypes.DATEONLY, allowNull: true },
  ditugaskan_kasi_id: { type: DataTypes.INTEGER, allowNull: true },
  dokumen_permohonan_url: { type: DataTypes.STRING(500), allowNull: true },
  laporan_audit_url: { type: DataTypes.STRING(500), allowNull: true },
  sertifikat_url: { type: DataTypes.STRING(500), allowNull: true },
  catatan: { type: DataTypes.TEXT, allowNull: true },
  dibuat_oleh: { type: DataTypes.INTEGER, allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: "sertifikasi_pangan",
  timestamps: false,
});

export default SertifikasiPangan;
