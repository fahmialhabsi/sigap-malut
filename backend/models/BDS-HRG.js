// =====================================================
// MODEL: BdsHrg
// TABLE: bds_hrg
// MODULE: BDS-HRG
// Generated: 2026-02-17T19:24:47.442Z
// =====================================================

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const BdsHrg = sequelize.define('BdsHrg', {
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
    comment: 'FK ke layanan_menpanrb (LY087-LY091)',
  },
  jenis_layanan_harga: {
    type: DataTypes.ENUM('Pemantauan Harga', 'Analisis Fluktuasi', 'Rekomendasi Stabilisasi', 'Operasi Pasar', 'Koordinasi TPID'),
    allowNull: false,
    comment: 'Jenis layanan harga',
  },
  periode: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Bulan periode',
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
  pasar_id: {
    type: DataTypes.INTEGER,
    comment: 'FK ke tabel pasar',
  },
  nama_pasar: {
    type: DataTypes.STRING(255),
    comment: 'Denormalized',
  },
  tanggal_pantau: {
    type: DataTypes.DATEONLY,
    comment: 'Tanggal pemantauan harga',
  },
  harga: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Harga per satuan',
  },
  satuan: {
    type: DataTypes.STRING(20),
    defaultValue: 'kg',
    comment: 'Satuan harga',
  },
  harga_bulan_lalu: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Harga bulan sebelumnya',
  },
  perubahan_harga: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Selisih harga',
  },
  persentase_perubahan: {
    type: DataTypes.DECIMAL(5,2),
    comment: 'Persentase perubahan',
  },
  tren_harga: {
    type: DataTypes.ENUM('Naik', 'Stabil', 'Turun'),
    comment: 'Tren harga',
  },
  tingkat_fluktuasi: {
    type: DataTypes.ENUM('Rendah', 'Sedang', 'Tinggi'),
    comment: 'Tingkat fluktuasi',
  },
  penyebab_fluktuasi: {
    type: DataTypes.TEXT,
    comment: 'Penyebab perubahan harga',
  },
  dampak_fluktuasi: {
    type: DataTypes.TEXT,
    comment: 'Dampak terhadap masyarakat',
  },
  analisis_harga: {
    type: DataTypes.TEXT,
    comment: 'Analisis kondisi harga',
  },
  prediksi_harga: {
    type: DataTypes.TEXT,
    comment: 'Prediksi harga ke depan',
  },
  rekomendasi_stabilisasi: {
    type: DataTypes.TEXT,
    comment: 'Rekomendasi tindakan stabilisasi',
  },
  jenis_operasi_pasar: {
    type: DataTypes.ENUM('Pasar Murah', 'Subsidi', 'Bantuan Langsung', 'Lainnya'),
    comment: 'Jenis operasi pasar',
  },
  tanggal_operasi_pasar: {
    type: DataTypes.DATEONLY,
    comment: 'Kapan operasi pasar dilakukan',
  },
  lokasi_operasi_pasar: {
    type: DataTypes.STRING(255),
    comment: 'Dimana operasi pasar',
  },
  komoditas_operasi_pasar: {
    type: DataTypes.TEXT,
    comment: 'Komoditas yang dijual murah',
  },
  harga_pasar_normal: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Harga pasar biasa',
  },
  harga_operasi_pasar: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Harga saat operasi pasar',
  },
  subsidi_per_unit: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Besaran subsidi',
  },
  volume_operasi_pasar: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Volume yang dijual',
  },
  jumlah_pembeli: {
    type: DataTypes.INTEGER,
    comment: 'Jumlah pembeli',
  },
  total_nilai_subsidi: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Total subsidi yang diberikan',
  },
  sumber_anggaran: {
    type: DataTypes.STRING(255),
    comment: 'APBD/APBN/Lainnya',
  },
  tanggal_rapat_tpid: {
    type: DataTypes.DATEONLY,
    comment: 'Tanggal rapat TPID',
  },
  tempat_rapat_tpid: {
    type: DataTypes.STRING(255),
    comment: 'Lokasi rapat TPID',
  },
  peserta_tpid: {
    type: DataTypes.TEXT,
    comment: 'Instansi yang hadir',
  },
  agenda_tpid: {
    type: DataTypes.TEXT,
    comment: 'Agenda rapat',
  },
  hasil_rapat_tpid: {
    type: DataTypes.TEXT,
    comment: 'Hasil keputusan TPID',
  },
  rekomendasi_tpid: {
    type: DataTypes.TEXT,
    comment: 'Rekomendasi dari TPID',
  },
  tindak_lanjut_tpid: {
    type: DataTypes.TEXT,
    comment: 'Tindak lanjut hasil rapat',
  },
  inflasi_pangan: {
    type: DataTypes.DECIMAL(5,2),
    comment: 'Inflasi pangan bulan ini',
  },
  target_inflasi_tpid: {
    type: DataTypes.DECIMAL(5,2),
    defaultValue: 2.50,
    comment: 'Target inflasi TPID',
  },
  status_inflasi: {
    type: DataTypes.ENUM('On Target', 'Warning', 'Alert'),
    comment: 'Status vs target',
  },
  file_data_harga: {
    type: DataTypes.STRING(255),
    comment: 'Upload data harga Excel',
  },
  file_notulensi_tpid: {
    type: DataTypes.STRING(255),
    comment: 'Notulensi rapat TPID',
  },
  file_foto_operasi_pasar: {
    type: DataTypes.JSON,
    comment: 'Foto operasi pasar',
  },
  file_laporan: {
    type: DataTypes.STRING(255),
    comment: 'Laporan PDF',
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
    defaultValue: 'Sekretariat/Pimpinan/TPID',
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
    comment: 'Data harga sensitif (kecuali operasi pasar)',
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
  tableName: 'bds_hrg',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default BdsHrg;
