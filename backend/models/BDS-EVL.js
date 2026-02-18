// =====================================================
// MODEL: BdsEvl
// TABLE: bds_evl
// MODULE: BDS-EVL
// Generated: 2026-02-17T19:24:47.440Z
// =====================================================

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const BdsEvl = sequelize.define('BdsEvl', {
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
    comment: 'FK ke layanan_menpanrb (LY102-LY105)',
  },
  jenis_evaluasi: {
    type: DataTypes.ENUM('Evaluasi Distribusi', 'Evaluasi Stabilisasi Harga', 'Evaluasi CPPD', 'Data SAKIP'),
    allowNull: false,
    comment: 'Jenis evaluasi',
  },
  periode: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Periode evaluasi',
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
  judul_evaluasi: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Judul laporan evaluasi',
  },
  objek_evaluasi: {
    type: DataTypes.STRING(255),
    comment: 'Apa yang dievaluasi',
  },
  tujuan_evaluasi: {
    type: DataTypes.TEXT,
    comment: 'Tujuan evaluasi',
  },
  metode_evaluasi: {
    type: DataTypes.ENUM('Desk Evaluation', 'Field Visit', 'Survey', 'Interview', 'FGD', 'Kombinasi'),
    comment: 'Metode evaluasi',
  },
  tim_evaluasi: {
    type: DataTypes.TEXT,
    comment: 'Anggota tim evaluasi',
  },
  tanggal_evaluasi: {
    type: DataTypes.DATEONLY,
    comment: 'Kapan evaluasi dilakukan',
  },
  lokasi_evaluasi: {
    type: DataTypes.STRING(255),
    comment: 'Dimana evaluasi',
  },
  program_dievaluasi: {
    type: DataTypes.TEXT,
    comment: 'Program yang dievaluasi',
  },
  target_program: {
    type: DataTypes.TEXT,
    comment: 'Target yang ditetapkan',
  },
  realisasi_program: {
    type: DataTypes.TEXT,
    comment: 'Realisasi pencapaian',
  },
  persentase_capaian: {
    type: DataTypes.DECIMAL(5,2),
    comment: 'Persen capaian',
  },
  indikator_kinerja: {
    type: DataTypes.TEXT,
    comment: 'Indikator yang digunakan',
  },
  temuan_evaluasi: {
    type: DataTypes.TEXT,
    comment: 'Temuan hasil evaluasi',
  },
  analisis_capaian: {
    type: DataTypes.TEXT,
    comment: 'Analisis pencapaian',
  },
  permasalahan: {
    type: DataTypes.TEXT,
    comment: 'Masalah yang dihadapi',
  },
  kendala: {
    type: DataTypes.TEXT,
    comment: 'Kendala pelaksanaan',
  },
  solusi: {
    type: DataTypes.TEXT,
    comment: 'Solusi yang diambil',
  },
  best_practice: {
    type: DataTypes.TEXT,
    comment: 'Praktik baik',
  },
  lesson_learned: {
    type: DataTypes.TEXT,
    comment: 'Pelajaran yang didapat',
  },
  rekomendasi: {
    type: DataTypes.TEXT,
    comment: 'Rekomendasi perbaikan',
  },
  tindak_lanjut: {
    type: DataTypes.TEXT,
    comment: 'Rencana tindak lanjut',
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
  output_program: {
    type: DataTypes.TEXT,
    comment: 'Output yang dihasilkan',
  },
  outcome_program: {
    type: DataTypes.TEXT,
    comment: 'Outcome yang dicapai',
  },
  dampak_program: {
    type: DataTypes.TEXT,
    comment: 'Dampak program',
  },
  file_laporan: {
    type: DataTypes.STRING(255),
    comment: 'Upload laporan evaluasi PDF',
  },
  file_data_pendukung: {
    type: DataTypes.JSON,
    comment: 'Array file pendukung',
  },
  file_foto: {
    type: DataTypes.JSON,
    comment: 'Foto dokumentasi',
  },
  ditujukan_kepada: {
    type: DataTypes.STRING(255),
    defaultValue: 'Sekretariat',
    comment: 'Kepada siapa laporan',
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
    comment: 'Yang melaksanakan',
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
    comment: 'Data evaluasi sensitif',
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
  tableName: 'bds_evl',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default BdsEvl;
