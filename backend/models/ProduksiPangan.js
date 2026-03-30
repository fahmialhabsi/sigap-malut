// M033: Data Produksi Pangan
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ProduksiPangan = sequelize.define('ProduksiPangan', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  periode_bulan: { type: DataTypes.TINYINT, allowNull: false },
  periode_tahun: { type: DataTypes.INTEGER, allowNull: false },
  kabupaten_kota: { type: DataTypes.STRING(100), allowNull: false },
  komoditas_id: { type: DataTypes.INTEGER, allowNull: false },
  volume_produksi: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  satuan: { type: DataTypes.STRING(20), defaultValue: 'ton' },
  sumber_data: {
    type: DataTypes.ENUM('survei_lapangan', 'dinas_pertanian', 'bps', 'estimasi'),
    allowNull: false
  },
  catatan: { type: DataTypes.TEXT },
  diinput_oleh: { type: DataTypes.INTEGER, allowNull: false },
  diverifikasi_oleh: { type: DataTypes.INTEGER },
  status: {
    type: DataTypes.ENUM('draft', 'terverifikasi', 'disetujui'),
    defaultValue: 'draft'
  },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'produksi_pangan',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default ProduksiPangan;
