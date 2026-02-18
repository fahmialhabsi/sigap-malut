// =====================================================
// MODEL: SekKbj
// TABLE: sek_kbj
// MODULE: SEK-KBJ
// Generated: 2026-02-17T19:24:47.384Z
// =====================================================

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SekKbj = sequelize.define('SekKbj', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  layanan_id: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: 'FK ke layanan_menpanrb (LY046-LY047)',
  },
  jenis_layanan_kebijakan: {
    type: DataTypes.ENUM('Bahan Kebijakan Teknis', 'Rekapitulasi Laporan'),
    allowNull: false,
    comment: 'Jenis layanan',
  },
  judul: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Judul kebijakan/laporan',
  },
  periode: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: 'Periode laporan (bulanan/triwulan/semester/tahunan)',
  },
  tahun: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Tahun',
  },
  ruang_lingkup: {
    type: DataTypes.TEXT,
    comment: 'Cakupan kebijakan/laporan',
  },
  latar_belakang: {
    type: DataTypes.TEXT,
    comment: 'Background',
  },
  permasalahan: {
    type: DataTypes.TEXT,
    comment: 'Masalah yang dihadapi',
  },
  analisis: {
    type: DataTypes.TEXT,
    comment: 'Analisis situasi',
  },
  opsi_kebijakan: {
    type: DataTypes.TEXT,
    comment: 'Alternatif kebijakan',
  },
  rekomendasi_kebijakan: {
    type: DataTypes.TEXT,
    comment: 'Rekomendasi kebijakan',
  },
  dampak: {
    type: DataTypes.TEXT,
    comment: 'Dampak yang diharapkan',
  },
  dasar_hukum: {
    type: DataTypes.TEXT,
    comment: 'Landasan hukum',
  },
  sumber_data_bidang_ketersediaan: {
    type: DataTypes.TEXT,
    comment: 'Ringkasan dari Bidang Ketersediaan',
  },
  sumber_data_bidang_distribusi: {
    type: DataTypes.TEXT,
    comment: 'Ringkasan dari Bidang Distribusi',
  },
  sumber_data_bidang_konsumsi: {
    type: DataTypes.TEXT,
    comment: 'Ringkasan dari Bidang Konsumsi',
  },
  sumber_data_uptd: {
    type: DataTypes.TEXT,
    comment: 'Ringkasan dari UPTD',
  },
  rekapitulasi_keuangan: {
    type: DataTypes.TEXT,
    comment: 'Ringkasan keuangan',
  },
  rekapitulasi_program: {
    type: DataTypes.TEXT,
    comment: 'Ringkasan program',
  },
  rekapitulasi_capaian: {
    type: DataTypes.TEXT,
    comment: 'Ringkasan capaian kinerja',
  },
  kesimpulan: {
    type: DataTypes.TEXT,
    comment: 'Kesimpulan',
  },
  tindak_lanjut: {
    type: DataTypes.TEXT,
    comment: 'Rencana tindak lanjut',
  },
  file_dokumen: {
    type: DataTypes.STRING(255),
    comment: 'Upload dokumen PDF',
  },
  file_lampiran: {
    type: DataTypes.JSON,
    comment: 'Array file lampiran',
  },
  ditujukan_kepada: {
    type: DataTypes.STRING(255),
    comment: 'Kepada siapa ditujukan (Kepala Dinas/Gubernur)',
  },
  penanggung_jawab: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: 'Sekretaris',
    comment: 'PIC (Sekretaris)',
  },
  pelaksana: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Yang menyusun',
  },
  is_sensitive: {
    type: DataTypes.ENUM('Biasa', 'Sensitif'),
    allowNull: false,
    defaultValue: 'Sensitif',
    comment: 'Data kebijakan sensitif',
  },
  status: {
    type: DataTypes.ENUM('draft', 'review', 'finalisasi', 'disetujui'),
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
  tableName: 'sek_kbj',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default SekKbj;
