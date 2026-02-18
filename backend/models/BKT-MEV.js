// =====================================================
// MODEL: BktMev
// TABLE: bkt_mev
// MODULE: BKT-MEV
// Generated: 2026-02-17T19:24:47.427Z
// =====================================================

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const BktMev = sequelize.define('BktMev', {
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
    comment: 'FK ke layanan_menpanrb (LY072-LY076)',
  },
  jenis_monev: {
    type: DataTypes.ENUM('Monev Pelaporan', 'Monev Penanganan Kerawanan', 'Laporan Kinerja', 'Laporan Teknis', 'Data SAKIP'),
    allowNull: false,
    comment: 'Jenis monev',
  },
  periode: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Periode monev/laporan',
  },
  tahun: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Tahun',
  },
  bulan: {
    type: DataTypes.INTEGER,
    comment: 'Bulan (1-12) jika bulanan',
  },
  triwulan: {
    type: DataTypes.INTEGER,
    comment: 'Triwulan (1-4) jika triwulanan',
  },
  semester: {
    type: DataTypes.INTEGER,
    comment: 'Semester (1-2) jika semesteran',
  },
  judul_laporan: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Judul laporan',
  },
  objek_monev: {
    type: DataTypes.STRING(255),
    comment: 'Apa yang di-monev',
  },
  lokasi_monev: {
    type: DataTypes.STRING(255),
    comment: 'Dimana monev dilakukan',
  },
  tanggal_monev: {
    type: DataTypes.DATEONLY,
    comment: 'Kapan monev dilakukan',
  },
  metode_monev: {
    type: DataTypes.ENUM('Desk Evaluation', 'Field Visit', 'Survey', 'Interview', 'FGD', 'Lainnya'),
    comment: 'Metode monev',
  },
  tim_monev: {
    type: DataTypes.TEXT,
    comment: 'Anggota tim monev',
  },
  program_yang_dimonev: {
    type: DataTypes.TEXT,
    comment: 'Program/kegiatan yang di-monev',
  },
  target_kinerja: {
    type: DataTypes.TEXT,
    comment: 'Target yang ditetapkan',
  },
  realisasi_kinerja: {
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
  temuan_monev: {
    type: DataTypes.TEXT,
    comment: 'Temuan hasil monev',
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
    comment: 'Praktik baik yang ditemukan',
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
    comment: 'Indikator Kinerja Kunci',
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
    comment: 'Upload laporan PDF',
  },
  file_data_pendukung: {
    type: DataTypes.JSON,
    comment: 'Array file pendukung',
  },
  file_foto_monev: {
    type: DataTypes.JSON,
    comment: 'Array foto dokumentasi monev',
  },
  ditujukan_kepada: {
    type: DataTypes.STRING(255),
    comment: 'Sekretariat/Kepala Dinas',
  },
  rincian_layanan: {
    type: DataTypes.TEXT,
    comment: 'Detail layanan',
  },
  penanggung_jawab: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: 'Kepala Bidang Ketersediaan',
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
    comment: 'Data monev sensitif',
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
  tableName: 'bkt_mev',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default BktMev;
