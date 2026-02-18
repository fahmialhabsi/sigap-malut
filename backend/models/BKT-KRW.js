// =====================================================
// MODEL: BktKrw
// TABLE: bkt_krw
// MODULE: BKT-KRW
// Generated: 2026-02-17T19:24:47.425Z
// =====================================================

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const BktKrw = sequelize.define('BktKrw', {
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
    comment: 'FK ke layanan_menpanrb (LY062-LY065)',
  },
  jenis_kerawanan: {
    type: DataTypes.ENUM('Identifikasi', 'Peta Kerawanan', 'Rencana Aksi', 'Koordinasi Lintas Sektor'),
    allowNull: false,
    comment: 'Jenis kerawanan',
  },
  periode: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Periode pemetaan/identifikasi',
  },
  tahun: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Tahun',
  },
  kabupaten: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Kabupaten',
  },
  kecamatan: {
    type: DataTypes.STRING(100),
    comment: 'Kecamatan',
  },
  desa: {
    type: DataTypes.STRING(100),
    comment: 'Desa',
  },
  latitude: {
    type: DataTypes.DECIMAL(10,8),
    comment: 'Koordinat GPS latitude',
  },
  longitude: {
    type: DataTypes.DECIMAL(11,8),
    comment: 'Koordinat GPS longitude',
  },
  tingkat_kerawanan: {
    type: DataTypes.ENUM('Prioritas 1', 'Prioritas 2', 'Prioritas 3', 'Prioritas 4', 'Prioritas 5', 'Prioritas 6'),
    allowNull: false,
    comment: 'Prioritas kerawanan (1=paling rawan)',
  },
  skor_kerawanan: {
    type: DataTypes.DECIMAL(5,2),
    comment: 'Skor hasil perhitungan',
  },
  indikator_ketersediaan_pangan: {
    type: DataTypes.DECIMAL(5,2),
    comment: 'Skor indikator ketersediaan',
  },
  indikator_akses_pangan: {
    type: DataTypes.DECIMAL(5,2),
    comment: 'Skor indikator akses',
  },
  indikator_pemanfaatan_pangan: {
    type: DataTypes.DECIMAL(5,2),
    comment: 'Skor indikator pemanfaatan',
  },
  indikator_kerawanan_kesehatan: {
    type: DataTypes.DECIMAL(5,2),
    comment: 'Skor indikator kesehatan',
  },
  jumlah_penduduk: {
    type: DataTypes.INTEGER,
    comment: 'Total penduduk wilayah',
  },
  jumlah_kk: {
    type: DataTypes.INTEGER,
    comment: 'Jumlah kepala keluarga',
  },
  jumlah_kk_miskin: {
    type: DataTypes.INTEGER,
    comment: 'KK miskin',
  },
  persentase_kemiskinan: {
    type: DataTypes.DECIMAL(5,2),
    comment: 'Persen kemiskinan',
  },
  stunting_prevalensi: {
    type: DataTypes.DECIMAL(5,2),
    comment: 'Persentase stunting',
  },
  wasting_prevalensi: {
    type: DataTypes.DECIMAL(5,2),
    comment: 'Persentase wasting',
  },
  underweight_prevalensi: {
    type: DataTypes.DECIMAL(5,2),
    comment: 'Persentase underweight',
  },
  jenis_pangan_rawan: {
    type: DataTypes.TEXT,
    comment: 'Komoditas yang rawan',
  },
  stok_pangan: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Stok pangan di wilayah',
  },
  satuan_stok: {
    type: DataTypes.STRING(20),
    defaultValue: 'kg',
    comment: 'Satuan stok',
  },
  tanggal_update_stok: {
    type: DataTypes.DATEONLY,
    comment: 'Kapan data di-update',
  },
  status_ketersediaan: {
    type: DataTypes.ENUM('Aman', 'Waspada', 'Rawan', 'Sangat Rawan'),
    comment: 'Status ketersediaan wilayah',
  },
  penyebab_kerawanan: {
    type: DataTypes.TEXT,
    comment: 'Faktor penyebab',
  },
  dampak_kerawanan: {
    type: DataTypes.TEXT,
    comment: 'Dampak yang terjadi',
  },
  rencana_aksi: {
    type: DataTypes.TEXT,
    comment: 'Rencana penanganan',
  },
  target_intervensi: {
    type: DataTypes.TEXT,
    comment: 'Target yang ingin dicapai',
  },
  waktu_pelaksanaan: {
    type: DataTypes.STRING(100),
    comment: 'Kapan dilaksanakan',
  },
  anggaran_kebutuhan: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Estimasi anggaran',
  },
  sumber_anggaran: {
    type: DataTypes.STRING(255),
    comment: 'Dari mana anggarannya',
  },
  instansi_terkait: {
    type: DataTypes.TEXT,
    comment: 'Instansi yang terlibat koordinasi',
  },
  koordinasi_dengan: {
    type: DataTypes.TEXT,
    comment: 'Lintas sektor mana',
  },
  hasil_koordinasi: {
    type: DataTypes.TEXT,
    comment: 'Hasil rapat koordinasi',
  },
  tindak_lanjut_koordinasi: {
    type: DataTypes.TEXT,
    comment: 'Tindak lanjut koordinasi',
  },
  file_peta: {
    type: DataTypes.STRING(255),
    comment: 'Upload peta kerawanan (PNG/PDF)',
  },
  file_data_gis: {
    type: DataTypes.STRING(255),
    comment: 'Upload shapefile (ZIP)',
  },
  file_laporan: {
    type: DataTypes.STRING(255),
    comment: 'Laporan identifikasi PDF',
  },
  file_rencana_aksi: {
    type: DataTypes.STRING(255),
    comment: 'Dokumen rencana aksi',
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
    defaultValue: 'Pemerintah Daerah/Masyarakat',
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
    comment: 'Data kerawanan sensitif',
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
  tableName: 'bkt_krw',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default BktKrw;
