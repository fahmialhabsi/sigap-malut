// =====================================================
// MODEL: BdsLap
// TABLE: bds_lap
// MODULE: BDS-LAP
// Generated: 2026-02-17T19:24:47.448Z
// =====================================================

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const BdsLap = sequelize.define('BdsLap', {
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
    defaultValue: 'LY106',
    comment: 'FK ke layanan_menpanrb',
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
  capaian_distribusi: {
    type: DataTypes.TEXT,
    comment: 'Capaian distribusi pangan',
  },
  capaian_stabilisasi_harga: {
    type: DataTypes.TEXT,
    comment: 'Capaian stabilisasi harga',
  },
  capaian_cppd: {
    type: DataTypes.TEXT,
    comment: 'Capaian pengelolaan CPPD',
  },
  inflasi_pangan: {
    type: DataTypes.DECIMAL(5,2),
    comment: 'Inflasi periode ini',
  },
  target_inflasi: {
    type: DataTypes.DECIMAL(5,2),
    defaultValue: 2.50,
    comment: 'Target TPID',
  },
  status_inflasi: {
    type: DataTypes.ENUM('On Target', 'Warning', 'Alert'),
    comment: 'Status vs target',
  },
  volume_distribusi_total: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Total distribusi',
  },
  stok_cppd: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Stok CPPD akhir periode',
  },
  operasi_pasar_dilakukan: {
    type: DataTypes.INTEGER,
    comment: 'Jumlah operasi pasar',
  },
  rapat_tpid_dilakukan: {
    type: DataTypes.INTEGER,
    comment: 'Jumlah rapat TPID',
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
    defaultValue: 'Kepala Bidang Distribusi',
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
  tableName: 'bds_lap',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default BdsLap;
