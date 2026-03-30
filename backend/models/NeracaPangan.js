// M035: Neraca Pangan
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const NeracaPangan = sequelize.define('NeracaPangan', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  periode: { type: DataTypes.STRING(20), allowNull: false },
  kabupaten_kota: { type: DataTypes.STRING(100), allowNull: false },
  komoditas_id: { type: DataTypes.INTEGER, allowNull: false },
  produksi: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  impor: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  ekspor: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  susut_tercecer: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  ketersediaan: { type: DataTypes.DECIMAL(12, 2) },
  kebutuhan: { type: DataTypes.DECIMAL(12, 2) },
  surplus_defisit: { type: DataTypes.DECIMAL(12, 2) },
  status: { type: DataTypes.ENUM('draft', 'final'), defaultValue: 'draft' },
  disusun_oleh: { type: DataTypes.INTEGER, allowNull: false },
  disetujui_oleh: { type: DataTypes.INTEGER },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  tableName: 'neraca_pangan',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default NeracaPangan;
