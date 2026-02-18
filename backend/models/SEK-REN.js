// =====================================================
// MODEL: SekRen
// TABLE: sek_ren
// MODULE: SEK-REN
// Generated: 2026-02-17T19:24:47.408Z
// =====================================================

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SekRen = sequelize.define('SekRen', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  layanan_id: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: 'FK ke layanan_menpanrb (LY040-LY045)',
  },
  jenis_layanan_perencanaan: {
    type: DataTypes.ENUM('Renstra', 'Renja', 'Fasilitasi Program', 'Sinkronisasi', 'LKJIP/LAKIP', 'Laporan Kinerja'),
    allowNull: false,
    comment: 'Jenis layanan perencanaan',
  },
  tahun_perencanaan: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Tahun perencanaan',
  },
  periode_renstra: {
    type: DataTypes.STRING(20),
    comment: 'Contoh: 2024-2029',
  },
  visi: {
    type: DataTypes.TEXT,
    comment: 'Visi organisasi',
  },
  misi: {
    type: DataTypes.TEXT,
    comment: 'Misi organisasi',
  },
  tujuan: {
    type: DataTypes.TEXT,
    comment: 'Tujuan strategis',
  },
  sasaran: {
    type: DataTypes.TEXT,
    comment: 'Sasaran',
  },
  strategi: {
    type: DataTypes.TEXT,
    comment: 'Strategi pencapaian',
  },
  kode_program: {
    type: DataTypes.STRING(50),
    comment: 'Kode program',
  },
  nama_program: {
    type: DataTypes.STRING(255),
    comment: 'Nama program',
  },
  kode_kegiatan: {
    type: DataTypes.STRING(50),
    comment: 'Kode kegiatan',
  },
  nama_kegiatan: {
    type: DataTypes.STRING(255),
    comment: 'Nama kegiatan',
  },
  indikator_kinerja: {
    type: DataTypes.TEXT,
    comment: 'Indikator keberhasilan',
  },
  target_kinerja: {
    type: DataTypes.STRING(255),
    comment: 'Target yang ingin dicapai',
  },
  satuan_target: {
    type: DataTypes.STRING(50),
    comment: 'Satuan target',
  },
  realisasi_kinerja: {
    type: DataTypes.STRING(255),
    comment: 'Realisasi pencapaian',
  },
  persentase_capaian: {
    type: DataTypes.DECIMAL(5,2),
    comment: 'Persen capaian target',
  },
  pagu_anggaran: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Pagu anggaran program/kegiatan',
  },
  bidang_pelaksana: {
    type: DataTypes.STRING(255),
    comment: 'Bidang yang melaksanakan',
  },
  penanggung_jawab_kegiatan: {
    type: DataTypes.STRING(255),
    comment: 'Penanggung jawab kegiatan',
  },
  waktu_pelaksanaan: {
    type: DataTypes.STRING(100),
    comment: 'Kapan dilaksanakan',
  },
  output: {
    type: DataTypes.TEXT,
    comment: 'Output kegiatan',
  },
  outcome: {
    type: DataTypes.TEXT,
    comment: 'Outcome program',
  },
  kendala: {
    type: DataTypes.TEXT,
    comment: 'Kendala yang dihadapi',
  },
  solusi: {
    type: DataTypes.TEXT,
    comment: 'Solusi atas kendala',
  },
  rekomendasi: {
    type: DataTypes.TEXT,
    comment: 'Rekomendasi perbaikan',
  },
  status_sinkronisasi: {
    type: DataTypes.ENUM('Belum', 'Proses', 'Sesuai', 'Tidak Sesuai'),
    comment: 'Sinkronisasi dengan RPJMD/RKPD',
  },
  file_renstra: {
    type: DataTypes.STRING(255),
    comment: 'Upload Renstra PDF',
  },
  file_renja: {
    type: DataTypes.STRING(255),
    comment: 'Upload Renja PDF',
  },
  file_lakip: {
    type: DataTypes.STRING(255),
    comment: 'Upload LAKIP PDF',
  },
  file_laporan_kinerja: {
    type: DataTypes.STRING(255),
    comment: 'Upload laporan PDF',
  },
  file_pendukung: {
    type: DataTypes.JSON,
    comment: 'Array file pendukung',
  },
  penanggung_jawab: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: 'Fungsional Perencana',
    comment: 'PIC',
  },
  pelaksana: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Yang melaksanakan',
  },
  is_sensitive: {
    type: DataTypes.ENUM('Biasa', 'Sensitif'),
    allowNull: false,
    defaultValue: 'Sensitif',
    comment: 'Data perencanaan sensitif',
  },
  status: {
    type: DataTypes.ENUM('draft', 'finalisasi', 'disetujui', 'final'),
    allowNull: false,
    defaultValue: 'draft',
    comment: 'Status dokumen',
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
  tableName: 'sek_ren',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default SekRen;
