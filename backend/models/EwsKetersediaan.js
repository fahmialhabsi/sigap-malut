// EWS: Early Warning System Ketersediaan
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const EwsKetersediaan = sequelize.define('EwsKetersediaan', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tanggal_alert: { type: DataTypes.DATEONLY, allowNull: false },
  jenis_indikator: {
    type: DataTypes.ENUM('stok_beras', 'produksi_padi', 'wilayah_rawan', 'harga_pangan', 'distribusi', 'bencana'),
    allowNull: false
  },
  nilai_aktual: { type: DataTypes.DECIMAL(10, 2) },
  threshold: { type: DataTypes.DECIMAL(10, 2) },
  level_alert: {
    type: DataTypes.ENUM('informasi', 'warning', 'kritis'),
    allowNull: false
  },
  deskripsi: { type: DataTypes.TEXT, allowNull: false },
  rekomendasi: { type: DataTypes.TEXT },
  status: {
    type: DataTypes.ENUM('aktif', 'ditangani', 'selesai'),
    defaultValue: 'aktif'
  },
  dikirim_ke_kadin: { type: DataTypes.BOOLEAN, defaultValue: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'ews_ketersediaan',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default EwsKetersediaan;
