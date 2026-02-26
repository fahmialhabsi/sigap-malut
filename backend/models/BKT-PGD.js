// =====================================================
// MODEL: BktPgd
// TABLE: bkt_pgd
// MODULE: BKT-PGD
// Generated: 2026-02-17T19:24:47.432Z
// =====================================================

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const BktPgd = sequelize.define('BktPgd', {
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
    comment: 'FK ke layanan_menpanrb (LY057-LY061)',
  },
  jenis_pengendalian: {
    type: DataTypes.ENUM('Pemantauan Produksi', 'Pemantauan Pasokan', 'Neraca Pangan', 'Early Warning', 'Sistem Informasi'),
    allowNull: false,
    comment: 'Jenis pengendalian',
  },
  periode: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Bulan periode (YYYY-MM-01)',
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
  komoditas_id: {
    type: DataTypes.INTEGER,
    comment: 'FK ke tabel komoditas (jika spesifik komoditas)',
  },
  nama_komoditas: {
    type: DataTypes.STRING(255),
    comment: 'Denormalized',
  },
  kabupaten: {
    type: DataTypes.STRING(100),
    comment: 'Wilayah',
  },
  kecamatan: {
    type: DataTypes.STRING(100),
    comment: 'Kecamatan',
  },
  luas_tanam: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Luas tanam',
  },
  luas_panen: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Luas panen',
  },
  produktivitas: {
    type: DataTypes.DECIMAL(10,2),
    comment: 'Produktivitas',
  },
  produksi_total: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Total produksi',
  },
  target_produksi: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Target produksi',
  },
  persentase_capaian: {
    type: DataTypes.DECIMAL(5,2),
    comment: 'Auto-calculate',
  },
  pasokan_lokal: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Pasokan dari produksi lokal',
  },
  pasokan_luar_daerah: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Pasokan dari luar',
  },
  pasokan_impor: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Pasokan impor',
  },
  total_pasokan: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Total ketersediaan',
  },
  konsumsi_estimasi: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Estimasi kebutuhan',
  },
  stok_awal: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Stok bulan lalu',
  },
  stok_akhir: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Stok bulan ini',
  },
  surplus_defisit: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Surplus atau defisit',
  },
  status_ketersediaan: {
    type: DataTypes.ENUM('Surplus', 'Aman', 'Menipis', 'Defisit'),
    defaultValue: 'Aman',
    comment: 'Status ketersediaan',
  },
  tingkat_kerawanan: {
    type: DataTypes.ENUM('Aman', 'Waspada', 'Rawan', 'Sangat Rawan'),
    defaultValue: 'Aman',
    comment: 'Tingkat kerawanan',
  },
  early_warning_status: {
    type: DataTypes.ENUM('Normal', 'Waspada', 'Siaga', 'Darurat'),
    defaultValue: 'Normal',
    comment: 'Status peringatan dini',
  },
  indikator_early_warning: {
    type: DataTypes.TEXT,
    comment: 'Indikator yang dipantau',
  },
  rekomendasi_ews: {
    type: DataTypes.TEXT,
    comment: 'Rekomendasi tindakan',
  },
  neraca_pangan_ketersediaan: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Neraca Bahan Makanan ketersediaan',
  },
  neraca_pangan_penggunaan: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'NBM penggunaan',
  },
  sumber_data: {
    type: DataTypes.STRING(255),
    comment: 'Sumber data (BPS Dinas Pertanian dll)',
  },
  metode_pengumpulan: {
    type: DataTypes.ENUM('Survey Lapangan', 'Desk Study', 'Koordinasi Instansi', 'Lainnya'),
    comment: 'Cara dapat data',
  },
  validitas_data: {
    type: DataTypes.ENUM('Valid', 'Perlu Verifikasi', 'Tidak Valid'),
    defaultValue: 'Valid',
    comment: 'Validitas data',
  },
  analisis: {
    type: DataTypes.TEXT,
    comment: 'Analisis kondisi',
  },
  kendala: {
    type: DataTypes.TEXT,
    comment: 'Kendala yang dihadapi',
  },
  rekomendasi: {
    type: DataTypes.TEXT,
    comment: 'Rekomendasi tindakan',
  },
  file_data: {
    type: DataTypes.STRING(255),
    comment: 'Upload data Excel/CSV',
  },
  file_laporan: {
    type: DataTypes.STRING(255),
    comment: 'Upload laporan PDF',
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
    comment: 'Siapa yang menerima',
  },
  jenis_data: {
    type: DataTypes.STRING(255),
    comment: 'Jenis data',
  },
  is_sensitive: {
    type: DataTypes.ENUM('Biasa', 'Sensitif'),
    allowNull: false,
    defaultValue: 'Sensitif',
    comment: 'Data produksi sensitif',
  },
  status: {
    type: DataTypes.ENUM('draft', 'review', 'final', 'publish'),
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
  tableName: 'bkt_pgd',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default BktPgd;
