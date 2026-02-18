// =====================================================
// MODEL: SekLds
// TABLE: sek_lds
// MODULE: SEK-LDS
// Generated: 2026-02-17T19:24:47.394Z
// =====================================================

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SekLds = sequelize.define('SekLds', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  layanan_id: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: 'LY049',
    comment: 'FK ke layanan_menpanrb',
  },
  periode: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Bulan periode laporan',
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
  rencana_distribusi: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Rencana distribusi bulan ini',
  },
  realisasi_distribusi: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Realisasi distribusi',
  },
  persentase_realisasi: {
    type: DataTypes.DECIMAL(5,2),
    comment: 'Auto-calculate',
  },
  inflasi_pangan_persen: {
    type: DataTypes.DECIMAL(5,2),
    comment: 'Inflasi bulan ini',
  },
  target_inflasi_tpid: {
    type: DataTypes.DECIMAL(5,2),
    defaultValue: 2.50,
    comment: 'Target TPID',
  },
  status_inflasi: {
    type: DataTypes.ENUM('On Target', 'Warning', 'Alert'),
    comment: 'Status inflasi',
  },
  harga_stabil: {
    type: DataTypes.INTEGER,
    comment: 'Jumlah komoditas harga stabil',
  },
  harga_naik: {
    type: DataTypes.INTEGER,
    comment: 'Jumlah komoditas harga naik',
  },
  harga_turun: {
    type: DataTypes.INTEGER,
    comment: 'Jumlah komoditas harga turun',
  },
  operasi_pasar_dilakukan: {
    type: DataTypes.INTEGER,
    comment: 'Jumlah operasi pasar dilakukan',
  },
  volume_operasi_pasar: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Total volume operasi pasar',
  },
  cppd_stok: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Stok cadangan pangan daerah',
  },
  cppd_pelepasan: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'CPPD yang dilepas',
  },
  cbp_bulog_stok: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Cadangan Beras Pemerintah',
  },
  distribusi_antar_wilayah: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Volume distribusi antar daerah',
  },
  analisis: {
    type: DataTypes.TEXT,
    comment: 'Analisis kondisi distribusi',
  },
  kendala: {
    type: DataTypes.TEXT,
    comment: 'Kendala yang dihadapi',
  },
  rekomendasi: {
    type: DataTypes.TEXT,
    comment: 'Rekomendasi tindakan',
  },
  sumber_data: {
    type: DataTypes.STRING(255),
    defaultValue: 'Bidang Distribusi & Cadangan Pangan',
    comment: 'Dari bidang mana',
  },
  file_laporan: {
    type: DataTypes.STRING(255),
    comment: 'Upload laporan PDF',
  },
  file_data_pendukung: {
    type: DataTypes.JSON,
    comment: 'Array file pendukung',
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
    defaultValue: 'Bidang Distribusi',
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
  tableName: 'sek_lds',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default SekLds;
