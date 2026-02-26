// =====================================================
// MODEL: BdsMon
// TABLE: bds_mon
// MODULE: BDS-MON
// Generated: 2026-02-17T19:24:47.450Z
// =====================================================

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const BdsMon = sequelize.define('BdsMon', {
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
    comment: 'FK ke layanan_menpanrb (LY082-LY086)',
  },
  jenis_monitoring: {
    type: DataTypes.ENUM('Arus Distribusi', 'Stok Pasar', 'Hambatan Distribusi', 'Fasilitasi Kelancaran', 'Koordinasi Wilayah'),
    allowNull: false,
    comment: 'Jenis monitoring',
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
    comment: 'FK ke tabel komoditas',
  },
  nama_komoditas: {
    type: DataTypes.STRING(255),
    comment: 'Denormalized',
  },
  wilayah_asal: {
    type: DataTypes.STRING(255),
    comment: 'Dari mana distribusi',
  },
  wilayah_tujuan: {
    type: DataTypes.STRING(255),
    comment: 'Ke mana distribusi',
  },
  volume_distribusi: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Volume yang didistribusikan',
  },
  satuan: {
    type: DataTypes.STRING(20),
    defaultValue: 'kg',
    comment: 'Satuan',
  },
  moda_transportasi: {
    type: DataTypes.ENUM('Darat', 'Laut', 'Udara'),
    comment: 'Transportasi yang digunakan',
  },
  tanggal_distribusi: {
    type: DataTypes.DATEONLY,
    comment: 'Kapan distribusi dilakukan',
  },
  frekuensi_distribusi: {
    type: DataTypes.INTEGER,
    comment: 'Berapa kali distribusi',
  },
  pasar_id: {
    type: DataTypes.INTEGER,
    comment: 'FK ke tabel pasar',
  },
  nama_pasar: {
    type: DataTypes.STRING(255),
    comment: 'Denormalized',
  },
  stok_pasar: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Stok tersedia di pasar',
  },
  stok_normal: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Stok dalam kondisi normal',
  },
  status_stok: {
    type: DataTypes.ENUM('Surplus', 'Aman', 'Menipis', 'Kritis'),
    defaultValue: 'Aman',
    comment: 'Status stok pasar',
  },
  jenis_hambatan: {
    type: DataTypes.ENUM('Infrastruktur', 'Cuaca', 'Administrasi', 'Keamanan', 'Biaya', 'Lainnya'),
    comment: 'Jenis hambatan distribusi',
  },
  lokasi_hambatan: {
    type: DataTypes.STRING(255),
    comment: 'Dimana hambatan terjadi',
  },
  deskripsi_hambatan: {
    type: DataTypes.TEXT,
    comment: 'Detail hambatan',
  },
  dampak_hambatan: {
    type: DataTypes.TEXT,
    comment: 'Dampak yang ditimbulkan',
  },
  tingkat_hambatan: {
    type: DataTypes.ENUM('Ringan', 'Sedang', 'Berat'),
    comment: 'Tingkat keparahan',
  },
  solusi_hambatan: {
    type: DataTypes.TEXT,
    comment: 'Solusi yang ditempuh',
  },
  status_penanganan: {
    type: DataTypes.ENUM('Belum Ditangani', 'Dalam Proses', 'Selesai'),
    comment: 'Status penanganan hambatan',
  },
  jenis_fasilitasi: {
    type: DataTypes.ENUM('Perizinan', 'Koordinasi', 'Bantuan Logistik', 'Lainnya'),
    comment: 'Jenis fasilitasi kelancaran',
  },
  penerima_fasilitasi: {
    type: DataTypes.STRING(255),
    comment: 'Siapa yang difasilitasi',
  },
  tindakan_fasilitasi: {
    type: DataTypes.TEXT,
    comment: 'Tindakan yang dilakukan',
  },
  hasil_fasilitasi: {
    type: DataTypes.TEXT,
    comment: 'Hasil fasilitasi',
  },
  instansi_koordinasi: {
    type: DataTypes.TEXT,
    comment: 'Instansi yang dikoordinasikan',
  },
  topik_koordinasi: {
    type: DataTypes.TEXT,
    comment: 'Topik rapat koordinasi',
  },
  hasil_koordinasi: {
    type: DataTypes.TEXT,
    comment: 'Hasil rapat koordinasi',
  },
  tindak_lanjut_koordinasi: {
    type: DataTypes.TEXT,
    comment: 'Tindak lanjut koordinasi',
  },
  analisis: {
    type: DataTypes.TEXT,
    comment: 'Analisis kondisi distribusi',
  },
  rekomendasi: {
    type: DataTypes.TEXT,
    comment: 'Rekomendasi tindakan',
  },
  file_data: {
    type: DataTypes.STRING(255),
    comment: 'Upload data Excel',
  },
  file_laporan: {
    type: DataTypes.STRING(255),
    comment: 'Upload laporan PDF',
  },
  file_foto: {
    type: DataTypes.JSON,
    comment: 'Array foto dokumentasi',
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
    comment: 'Data monitoring sensitif',
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
  tableName: 'bds_mon',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default BdsMon;
