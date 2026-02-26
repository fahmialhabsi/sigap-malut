// =====================================================
// MODEL: UptKep
// TABLE: upt_kep
// MODULE: UPT-KEP
// Generated: 2026-02-17T19:24:47.470Z
// =====================================================

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const UptKep = sequelize.define('UptKep', {
  unit_kerja: {
    type: DataTypes.ENUM('Sekretariat', 'UPTD', 'Bidang Ketersediaan', 'Bidang Distribusi', 'Bidang Konsumsi'),
    allowNull: false,
    defaultValue: 'UPTD',
    comment: 'AUTO-SET ke UPTD (field khusus UPTD)',
  },
  akses_terbatas: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'UPTD hanya bisa akses pegawai UPTD (field khusus UPTD)',
  },
  hak_akses_uptd: {
    type: DataTypes.ENUM('read_only', 'read_write'),
    allowNull: false,
    defaultValue: 'read_write',
    comment: 'UPTD bisa update data tertentu (cuti SKP) (field khusus UPTD)',
  }
}, {
  tableName: 'upt_kep',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default UptKep;
