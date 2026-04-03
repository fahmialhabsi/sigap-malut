// =====================================================
// MODEL: UptKeu
// TABLE: upt_keu
// MODULE: UPT-KEU
// Generated: 2026-03-19T23:39:23.520Z
// =====================================================

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const UptKeu = sequelize.define('UptKeu', {
  unit_kerja: {
    type: DataTypes.ENUM('"Sekretariat', 'UPTD', 'Bidang Ketersediaan', 'Bidang Distribusi', 'Bidang Konsumsi"'),
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
  },
  execution_thread_id: {
    type: DataTypes.STRING(36),
    allowNull: true,
    comment: 'Rantai eksekusi (execution thread)',
  },
  task_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Opsional: Tasks.id',
  },
}, {
  tableName: 'upt_keu',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default UptKeu;
