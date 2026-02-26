// =====================================================
// MODEL: BksKmn
// TABLE: bks_kmn
// MODULE: BKS-KMN
// Generated: 2026-02-17T19:24:47.458Z
// =====================================================

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const BksKmn = sequelize.define('BksKmn', {
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
    comment: 'FK ke layanan_menpanrb (LY117-LY121)',
  },
  jenis_kegiatan_keamanan: {
    type: DataTypes.ENUM('Pembinaan Pangan Segar', 'Sosialisasi Pangan Aman', 'Fasilitasi PSAT', 'Koordinasi Pengawasan', 'Rekomendasi Teknis'),
    allowNull: false,
    comment: 'Jenis kegiatan keamanan pangan',
  },
  tanggal_kegiatan: {
    type: DataTypes.DATEONLY,
    comment: 'Tanggal pelaksanaan',
  },
  lokasi: {
    type: DataTypes.STRING(255),
    comment: 'Lokasi kegiatan',
  },
  objek_pembinaan: {
    type: DataTypes.STRING(255),
    comment: 'Pasar/UMKM/Rumah Makan/dll',
  },
  jenis_pangan_segar: {
    type: DataTypes.TEXT,
    comment: 'Pangan segar yang dibina (sayur buah daging ikan)',
  },
  aspek_pembinaan: {
    type: DataTypes.TEXT,
    comment: 'Aspek yang dibina (kebersihan handling penyimpanan)',
  },
  jumlah_pelaku_dibina: {
    type: DataTypes.INTEGER,
    comment: 'Jumlah pedagang/pelaku yang dibina',
  },
  hasil_pembinaan: {
    type: DataTypes.TEXT,
    comment: 'Hasil pembinaan',
  },
  tindak_lanjut_pembinaan: {
    type: DataTypes.TEXT,
    comment: 'Tindak lanjut pembinaan',
  },
  materi_sosialisasi: {
    type: DataTypes.TEXT,
    comment: 'Materi sosialisasi pangan aman',
  },
  sasaran_sosialisasi: {
    type: DataTypes.STRING(255),
    comment: 'Pelaku usaha/masyarakat/pelajar',
  },
  jumlah_peserta_sosialisasi: {
    type: DataTypes.INTEGER,
    comment: 'Total peserta sosialisasi',
  },
  metode_sosialisasi: {
    type: DataTypes.ENUM('Penyuluhan', 'Workshop', 'Seminar', 'Media Massa', 'Lainnya'),
    comment: 'Metode sosialisasi',
  },
  psat_nama_usaha: {
    type: DataTypes.STRING(255),
    comment: 'Nama usaha PSAT yang difasilitasi',
  },
  psat_jenis_usaha: {
    type: DataTypes.ENUM('Rumah Makan', 'Katering', 'Jasa Boga', 'Kantin', 'Depot', 'Warung Makan', 'Lainnya'),
    comment: 'Jenis PSAT',
  },
  psat_alamat: {
    type: DataTypes.STRING(255),
    comment: 'Alamat usaha PSAT',
  },
  psat_pemilik: {
    type: DataTypes.STRING(255),
    comment: 'Nama pemilik',
  },
  psat_status_sertifikat: {
    type: DataTypes.ENUM('Belum', 'Proses', 'Sudah'),
    comment: 'Status sertifikat',
  },
  psat_jenis_fasilitasi: {
    type: DataTypes.TEXT,
    comment: 'Fasilitasi yang diberikan',
  },
  psat_kendala: {
    type: DataTypes.TEXT,
    comment: 'Kendala yang dihadapi',
  },
  psat_solusi: {
    type: DataTypes.TEXT,
    comment: 'Solusi yang diberikan',
  },
  instansi_koordinasi_pengawasan: {
    type: DataTypes.TEXT,
    comment: 'Instansi yang dikoordinasikan (Dinkes BPOM Polisi Pamong Praja)',
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
  tanggal_rapat: {
    type: DataTypes.DATEONLY,
    comment: 'Tanggal rapat koordinasi',
  },
  pemohon_rekomendasi: {
    type: DataTypes.STRING(255),
    comment: 'Siapa yang minta rekomendasi',
  },
  instansi_pemohon: {
    type: DataTypes.STRING(255),
    comment: 'Asal instansi pemohon',
  },
  permasalahan: {
    type: DataTypes.TEXT,
    comment: 'Permasalahan yang dihadapi',
  },
  analisis_teknis: {
    type: DataTypes.TEXT,
    comment: 'Analisis teknis',
  },
  rekomendasi_teknis: {
    type: DataTypes.TEXT,
    comment: 'Rekomendasi yang diberikan',
  },
  dasar_rekomendasi: {
    type: DataTypes.TEXT,
    comment: 'Dasar pemberian rekomendasi',
  },
  status_rekomendasi: {
    type: DataTypes.ENUM('Diproses', 'Diterbitkan', 'Ditolak'),
    comment: 'Status rekomendasi',
  },
  nomor_rekomendasi: {
    type: DataTypes.STRING(100),
    comment: 'Nomor surat rekomendasi',
  },
  tanggal_rekomendasi: {
    type: DataTypes.DATEONLY,
    comment: 'Tanggal surat rekomendasi',
  },
  file_surat_rekomendasi: {
    type: DataTypes.STRING(255),
    comment: 'Upload surat rekomendasi PDF',
  },
  file_dokumentasi: {
    type: DataTypes.JSON,
    comment: 'Array foto kegiatan',
  },
  file_laporan: {
    type: DataTypes.STRING(255),
    comment: 'Laporan kegiatan PDF',
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
    comment: 'Yang melaksanakan',
  },
  kelompok_penerima: {
    type: DataTypes.STRING(255),
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
    comment: 'Data keamanan pangan sensitif',
  },
  status: {
    type: DataTypes.ENUM('draft', 'proses', 'selesai'),
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
  tableName: 'bks_kmn',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default BksKmn;
