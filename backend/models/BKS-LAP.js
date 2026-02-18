// =====================================================
// MODEL: BksLap
// TABLE: bks_lap
// MODULE: BKS-LAP
// Generated: 2026-02-17T19:24:47.461Z
// =====================================================

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const BksLap = sequelize.define('BksLap', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  unit_kerja: {
    type: DataTypes.ENUM('Sekretariat', 'UPTD', 'Bidang Ketersediaan', 'Bidang Distribusi', 'Bidang Konsumsi'),
    allowNull: false,
    comment: 'Unit yang input data (AUTO-SET sesuai bidang)',
  },
  reported_to_sekretariat: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Sudah dilaporkan ke Sekretariat untuk konsolidasi',
  },
  reported_at: {
    type: DataTypes.DATE,
    comment: 'Kapan dilaporkan ke Sekretariat',
  },
  sekretariat_notes: {
    type: DataTypes.TEXT,
    comment: 'Catatan dari Sekretaris saat review/konsolidasi',
  },
  layanan_id: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: 'FK ke layanan_menpanrb (LY130-LY131)',
  },
  jenis_laporan: {
    type: DataTypes.ENUM('Laporan Kinerja', 'Data SAKIP'),
    allowNull: false,
    comment: 'Jenis laporan',
  },
  periode: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Periode laporan',
  },
  tahun: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Tahun',
  },
  bulan: {
    type: DataTypes.INTEGER,
    comment: 'Bulan (jika bulanan)',
  },
  triwulan: {
    type: DataTypes.INTEGER,
    comment: 'Triwulan (1-4)',
  },
  semester: {
    type: DataTypes.INTEGER,
    comment: 'Semester (1-2)',
  },
  judul_laporan: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Judul laporan kinerja',
  },
  ringkasan_eksekutif: {
    type: DataTypes.TEXT,
    comment: 'Ringkasan untuk pimpinan',
  },
  capaian_konsumsi_pangan: {
    type: DataTypes.TEXT,
    comment: 'Capaian program konsumsi',
  },
  capaian_penganekaragaman: {
    type: DataTypes.TEXT,
    comment: 'Capaian penganekaragaman pangan',
  },
  capaian_keamanan_pangan: {
    type: DataTypes.TEXT,
    comment: 'Capaian keamanan pangan',
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
    comment: 'Status vs target',
  },
  konsumsi_energi: {
    type: DataTypes.DECIMAL(10,2),
    comment: 'Konsumsi energi',
  },
  konsumsi_protein: {
    type: DataTypes.DECIMAL(10,2),
    comment: 'Konsumsi protein',
  },
  jumlah_kelompok_pangan_dibina: {
    type: DataTypes.INTEGER,
    comment: 'Jumlah kelompok dibina',
  },
  jumlah_psat_difasilitasi: {
    type: DataTypes.INTEGER,
    comment: 'PSAT yang difasilitasi',
  },
  jumlah_psat_tersertifikasi: {
    type: DataTypes.INTEGER,
    comment: 'PSAT tersertifikasi',
  },
  kegiatan_edukasi_dilakukan: {
    type: DataTypes.INTEGER,
    comment: 'Jumlah kegiatan edukasi',
  },
  peserta_edukasi_total: {
    type: DataTypes.INTEGER,
    comment: 'Total peserta edukasi',
  },
  kasus_keracunan_pangan: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Jumlah kasus keracunan',
  },
  data_sakip_ikk: {
    type: DataTypes.TEXT,
    comment: 'IKK SAKIP',
  },
  data_sakip_capaian: {
    type: DataTypes.DECIMAL(5,2),
    comment: 'Persentase capaian IKK',
  },
  data_sakip_target: {
    type: DataTypes.DECIMAL(5,2),
    comment: 'Target IKK',
  },
  anggaran_program: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Pagu anggaran',
  },
  realisasi_anggaran: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Realisasi anggaran',
  },
  persentase_serapan: {
    type: DataTypes.DECIMAL(5,2),
    comment: 'Auto-calculate',
  },
  permasalahan: {
    type: DataTypes.TEXT,
    comment: 'Masalah yang dihadapi',
  },
  solusi: {
    type: DataTypes.TEXT,
    comment: 'Solusi yang ditempuh',
  },
  rekomendasi: {
    type: DataTypes.TEXT,
    comment: 'Rekomendasi',
  },
  tindak_lanjut: {
    type: DataTypes.TEXT,
    comment: 'Rencana tindak lanjut',
  },
  file_laporan: {
    type: DataTypes.STRING(255),
    comment: 'Upload laporan PDF',
  },
  file_data_pendukung: {
    type: DataTypes.JSON,
    comment: 'Array file pendukung',
  },
  ditujukan_kepada: {
    type: DataTypes.STRING(255),
    defaultValue: 'Sekretariat',
    comment: 'Kepada siapa',
  },
  rincian_layanan: {
    type: DataTypes.TEXT,
    comment: 'Detail layanan',
  },
  penanggung_jawab: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: 'Kepala Bidang Konsumsi',
    comment: 'PIC',
  },
  pelaksana: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Yang menyusun',
  },
  kelompok_penerima: {
    type: DataTypes.STRING(255),
    defaultValue: 'Sekretariat/Pimpinan',
    comment: 'Siapa yang terima',
  },
  jenis_data: {
    type: DataTypes.STRING(255),
    comment: 'Jenis data',
  },
  is_sensitive: {
    type: DataTypes.ENUM('Biasa', 'Sensitif'),
    allowNull: false,
    defaultValue: 'Sensitif',
    comment: 'Laporan kinerja sensitif',
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
  tableName: 'bks_lap',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default BksLap;
