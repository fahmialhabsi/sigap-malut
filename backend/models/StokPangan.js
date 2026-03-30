// M034: Stok Pangan Gudang
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const StokPangan = sequelize.define('StokPangan', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  tanggal_update: { type: DataTypes.DATEONLY, allowNull: false },
  lokasi_gudang: { type: DataTypes.STRING(255), allowNull: false },
  kabupaten_kota: { type: DataTypes.STRING(100), allowNull: false },
  komoditas_id: { type: DataTypes.INTEGER, allowNull: false },
  volume_stok: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
  satuan: { type: DataTypes.STRING(20), defaultValue: 'ton' },
  estimasi_hari: { type: DataTypes.INTEGER },
  status_stok: {
    type: DataTypes.ENUM('aman', 'waspada', 'kritis'),
    defaultValue: 'aman'
  },
  diinput_oleh: { type: DataTypes.INTEGER, allowNull: false },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'stok_pangan',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default StokPangan;
