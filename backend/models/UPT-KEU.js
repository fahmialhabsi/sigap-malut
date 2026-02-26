// =====================================================
// MODEL: UptKeu
// TABLE: upt_keu
// MODULE: UPT-KEU
// Generated: 2026-02-17T19:24:47.471Z
// =====================================================

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const UptKeu = sequelize.define('UptKeu', {
  unit_kerja: {
    type: DataTypes.ENUM('Sekretariat', 'UPTD', 'Bidang Ketersediaan', 'Bidang Distribusi', 'Bidang Konsumsi'),
    allowNull: false,
    defaultValue: 'UPTD',
    comment: 'AUTO-SET ke UPTD (field khusus UPTD)',
  },
  kode_unit: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: '01',
    comment: 'Kode unit UPTD = 01 (field khusus UPTD)',
  },
  akses_terbatas: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'UPTD hanya bisa akses data sendiri (field khusus UPTD)',
  }
}, {
  tableName: 'upt_keu',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default UptKeu;
