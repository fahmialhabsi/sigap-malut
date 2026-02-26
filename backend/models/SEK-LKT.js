// =====================================================
// MODEL: SekLkt
// TABLE: sek_lkt
// MODULE: SEK-LKT
// Generated: 2026-02-17T19:24:47.402Z
// =====================================================

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SekLkt = sequelize.define('SekLkt', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  layanan_id: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: 'LY048',
    comment: 'FK ke layanan_menpanrb',
  },
  periode: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Bulan periode laporan (YYYY-MM-01)',
  },
  tahun: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Tahun',
  },
  bulan: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Bulan (1-12)',
  },
  total_komoditas: {
    type: DataTypes.INTEGER,
    comment: 'Jumlah komoditas dipantau',
  },
  total_stok: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Total stok pangan',
  },
  stok_aman: {
    type: DataTypes.INTEGER,
    comment: 'Jumlah komoditas stok aman',
  },
  stok_menipis: {
    type: DataTypes.INTEGER,
    comment: 'Jumlah komoditas stok menipis',
  },
  stok_kritis: {
    type: DataTypes.INTEGER,
    comment: 'Jumlah komoditas stok kritis',
  },
  wilayah_rawan_pangan: {
    type: DataTypes.INTEGER,
    comment: 'Jumlah wilayah rawan',
  },
  tingkat_kerawanan: {
    type: DataTypes.ENUM('Aman', 'Waspada', 'Rawan', 'Sangat Rawan'),
    allowNull: false,
    defaultValue: 'Aman',
    comment: 'Tingkat kerawanan pangan',
  },
  komoditas_kritis: {
    type: DataTypes.TEXT,
    comment: 'Daftar komoditas yang kritis',
  },
  produksi_pangan_total: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Total produksi bulan ini',
  },
  konsumsi_estimasi: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Estimasi kebutuhan',
  },
  surplus_defisit: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Produksi - Konsumsi',
  },
  analisis: {
    type: DataTypes.TEXT,
    comment: 'Analisis kondisi ketersediaan',
  },
  rekomendasi: {
    type: DataTypes.TEXT,
    comment: 'Rekomendasi tindakan',
  },
  sumber_data: {
    type: DataTypes.STRING(255),
    defaultValue: 'Bidang Ketersediaan & Kerawanan Pangan',
    comment: 'Dari bidang mana',
  },
  file_laporan: {
    type: DataTypes.STRING(255),
    comment: 'Upload laporan PDF',
  },
  file_data_pendukung: {
    type: DataTypes.JSON,
    comment: 'Array file Excel/data',
  },
  penanggung_jawab: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: 'Sekretaris',
    comment: 'PIC',
  },
  pelaksana: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: 'Bidang Ketersediaan',
    comment: 'Yang menyusun',
  },
  is_sensitive: {
    type: DataTypes.ENUM('Biasa', 'Sensitif'),
    allowNull: false,
    defaultValue: 'Biasa',
    comment: 'Klasifikasi data',
  },
  status: {
    type: DataTypes.ENUM('draft', 'review', 'final'),
    allowNull: false,
    defaultValue: 'draft',
    comment: 'Status',
  },
  keterangan: {
    type: DataTypes.TEXT,
    comment: 'Catatan',
  },
  created_by: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'User ID',
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'sek_lkt',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default SekLkt;
