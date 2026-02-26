// =====================================================
// MODEL: SekLks
// TABLE: sek_lks
// MODULE: SEK-LKS
// Generated: 2026-02-17T19:24:47.399Z
// =====================================================

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SekLks = sequelize.define('SekLks', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  layanan_id: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: 'LY050',
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
  skor_pph: {
    type: DataTypes.DECIMAL(5,2),
    comment: 'Skor Pola Pangan Harapan',
  },
  target_pph: {
    type: DataTypes.DECIMAL(5,2),
    defaultValue: 90,
    comment: 'Target PPH',
  },
  status_pph: {
    type: DataTypes.ENUM('On Target', 'Di Bawah Target'),
    comment: 'Status PPH',
  },
  konsumsi_kalori_per_kapita: {
    type: DataTypes.DECIMAL(10,2),
    comment: 'Rata-rata konsumsi kalori',
  },
  konsumsi_protein_per_kapita: {
    type: DataTypes.DECIMAL(10,2),
    comment: 'Rata-rata konsumsi protein',
  },
  total_penerima_sppg: {
    type: DataTypes.INTEGER,
    comment: 'Jumlah penerima SPPG',
  },
  distribusi_sppg_realisasi: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Realisasi distribusi SPPG',
  },
  program_mbg_penerima: {
    type: DataTypes.INTEGER,
    comment: 'Penerima Makan Bergizi Gratis',
  },
  program_diversifikasi: {
    type: DataTypes.INTEGER,
    comment: 'Jumlah program diversifikasi',
  },
  inspeksi_keamanan_pangan: {
    type: DataTypes.INTEGER,
    comment: 'Jumlah inspeksi keamanan pangan',
  },
  pangan_aman: {
    type: DataTypes.INTEGER,
    comment: 'Hasil inspeksi: aman',
  },
  pangan_tidak_aman: {
    type: DataTypes.INTEGER,
    comment: 'Hasil inspeksi: tidak aman',
  },
  kasus_keracunan: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Jumlah kasus keracunan pangan',
  },
  korban_keracunan: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Jumlah korban',
  },
  tindakan_terhadap_keracunan: {
    type: DataTypes.TEXT,
    comment: 'Tindakan atas keracunan',
  },
  edukasi_dilakukan: {
    type: DataTypes.INTEGER,
    comment: 'Jumlah kegiatan edukasi',
  },
  peserta_edukasi: {
    type: DataTypes.INTEGER,
    comment: 'Total peserta edukasi',
  },
  analisis: {
    type: DataTypes.TEXT,
    comment: 'Analisis kondisi konsumsi & keamanan',
  },
  rekomendasi: {
    type: DataTypes.TEXT,
    comment: 'Rekomendasi tindakan',
  },
  sumber_data: {
    type: DataTypes.STRING(255),
    defaultValue: 'Bidang Konsumsi & Keamanan Pangan',
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
    defaultValue: 'Bidang Konsumsi',
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
  tableName: 'sek_lks',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default SekLks;
