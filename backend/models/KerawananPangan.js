// M036: Peta Kerawanan Pangan
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const KerawananPangan = sequelize.define('KerawananPangan', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  periode: { type: DataTypes.STRING(20), allowNull: false },
  kabupaten_kota: { type: DataTypes.STRING(100), allowNull: false },
  kecamatan: { type: DataTypes.STRING(100) },
  skor_kerawanan: { type: DataTypes.DECIMAL(5, 2) },
  status_kerawanan: {
    type: DataTypes.ENUM('aman', 'waspada', 'rawan', 'sangat_rawan'),
    allowNull: false
  },
  aspek_stok: { type: DataTypes.DECIMAL(5, 2) },
  aspek_akses: { type: DataTypes.DECIMAL(5, 2) },
  aspek_pemanfaatan: { type: DataTypes.DECIMAL(5, 2) },
  aspek_stabilitas: { type: DataTypes.DECIMAL(5, 2) },
  jumlah_penduduk_terdampak: { type: DataTypes.INTEGER },
  catatan: { type: DataTypes.TEXT },
  diinput_oleh: { type: DataTypes.INTEGER, allowNull: false },
  diverifikasi_oleh: { type: DataTypes.INTEGER },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'kerawanan_pangan',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default KerawananPangan;
