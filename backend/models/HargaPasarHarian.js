// Harga Pasar Harian untuk Distribusi
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const HargaPasarHarian = sequelize.define('HargaPasarHarian', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tanggal: { type: DataTypes.DATEONLY, allowNull: false },
  kabupaten_kota: { type: DataTypes.STRING(100), allowNull: false },
  nama_pasar: { type: DataTypes.STRING(255), allowNull: false },
  komoditas_id: { type: DataTypes.INTEGER, allowNull: false },
  harga_eceran: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  harga_grosir: { type: DataTypes.DECIMAL(12, 2) },
  satuan: { type: DataTypes.STRING(20), defaultValue: 'kg' },
  harga_acuan: { type: DataTypes.DECIMAL(12, 2) },
  persen_deviasi: { type: DataTypes.DECIMAL(6, 2) },
  status_harga: {
    type: DataTypes.ENUM('normal', 'fluktuasi_ringan', 'fluktuasi_sedang', 'kritis'),
    defaultValue: 'normal'
  },
  sumber: { type: DataTypes.STRING(255) },
  diinput_oleh: { type: DataTypes.INTEGER, allowNull: false },
  diverifikasi_oleh: { type: DataTypes.INTEGER },
  status_verifikasi: {
    type: DataTypes.ENUM('draft', 'terverifikasi', 'disetujui'),
    defaultValue: 'draft'
  },
  catatan: { type: DataTypes.TEXT },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'harga_pasar_harian',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default HargaPasarHarian;
