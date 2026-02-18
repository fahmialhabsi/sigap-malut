// =====================================================
// MODEL: UptAst
// TABLE: upt_ast
// MODULE: UPT-AST
// Generated: 2026-02-17T19:24:47.467Z
// =====================================================

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const UptAst = sequelize.define('UptAst', {
  unit_kerja: {
    type: DataTypes.ENUM('Sekretariat', 'UPTD', 'Bidang Ketersediaan', 'Bidang Distribusi', 'Bidang Konsumsi'),
    allowNull: false,
    defaultValue: 'UPTD',
    comment: 'AUTO-SET ke UPTD (field khusus UPTD)',
  },
  lokasi_unit: {
    type: DataTypes.STRING(255),
    defaultValue: 'UPTD Balai Pengawasan Mutu',
    comment: 'Lokasi fisik aset UPTD (field khusus UPTD)',
  },
  kategori_aset_uptd: {
    type: DataTypes.ENUM('Alat Inspeksi', 'Peralatan Lab', 'Alat Kantor', 'Kendaraan', 'Lainnya'),
    comment: 'Kategori khusus aset UPTD (field khusus UPTD)',
  },
  akses_terbatas: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'UPTD hanya bisa akses aset sendiri (field khusus UPTD)',
  }
}, {
  tableName: 'upt_ast',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default UptAst;
