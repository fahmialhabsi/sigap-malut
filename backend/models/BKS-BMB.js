// =====================================================
// MODEL: BksBmb
// TABLE: bks_bmb
// MODULE: BKS-BMB
// Generated: 2026-02-17T19:24:47.452Z
// =====================================================

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const BksBmb = sequelize.define('BksBmb', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  layanan_id: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: 'FK ke layanan_menpanrb (LY122-LY126)',
  },
  jenis_kegiatan: {
    type: DataTypes.ENUM('Bimtek Konsumsi', 'Bimtek Keamanan Pangan', 'Pelatihan Pengolahan', 'Penyuluhan', 'Konsultasi Teknis'),
    allowNull: false,
    comment: 'Jenis kegiatan',
  },
  nama_kegiatan: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Nama kegiatan',
  },
  tanggal_kegiatan: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Tanggal pelaksanaan',
  },
  waktu_mulai: {
    type: DataTypes.TIME,
    comment: 'Jam mulai',
  },
  waktu_selesai: {
    type: DataTypes.TIME,
    comment: 'Jam selesai',
  },
  tempat: {
    type: DataTypes.STRING(255),
    comment: 'Lokasi kegiatan',
  },
  kabupaten: {
    type: DataTypes.STRING(100),
    comment: 'Kabupaten',
  },
  sasaran_peserta: {
    type: DataTypes.STRING(255),
    comment: 'Aparatur/pelaku usaha/masyarakat/ibu rumah tangga',
  },
  jumlah_peserta: {
    type: DataTypes.INTEGER,
    comment: 'Total peserta',
  },
  narasumber: {
    type: DataTypes.STRING(255),
    comment: 'Nama narasumber',
  },
  fasilitator: {
    type: DataTypes.STRING(255),
    comment: 'Nama fasilitator',
  },
  materi_bimbingan: {
    type: DataTypes.TEXT,
    comment: 'Materi yang diberikan',
  },
  metode_pelaksanaan: {
    type: DataTypes.ENUM('Tatap Muka', 'Online', 'Hybrid', 'Praktik Langsung'),
    comment: 'Metode',
  },
  topik_bimtek_konsumsi: {
    type: DataTypes.STRING(255),
    comment: 'Topik bimtek konsumsi (B2SA PPH Diversifikasi dll)',
  },
  topik_bimtek_keamanan: {
    type: DataTypes.STRING(255),
    comment: 'Topik bimtek keamanan (PSAT Hygiene Sanitasi dll)',
  },
  jenis_pangan_lokal_diolah: {
    type: DataTypes.TEXT,
    comment: 'Pangan lokal yang diolah',
  },
  teknik_pengolahan: {
    type: DataTypes.TEXT,
    comment: 'Teknik pengolahan yang diajarkan',
  },
  produk_hasil_pelatihan: {
    type: DataTypes.TEXT,
    comment: 'Produk yang dihasilkan',
  },
  nilai_gizi_produk: {
    type: DataTypes.TEXT,
    comment: 'Kandungan gizi produk',
  },
  potensi_ekonomi: {
    type: DataTypes.TEXT,
    comment: 'Potensi ekonomi produk',
  },
  topik_penyuluhan: {
    type: DataTypes.STRING(255),
    comment: 'Topik penyuluhan',
  },
  lokasi_penyuluhan: {
    type: DataTypes.STRING(255),
    comment: 'Desa/kelurahan',
  },
  jumlah_sasaran_penyuluhan: {
    type: DataTypes.INTEGER,
    comment: 'Target sasaran penyuluhan',
  },
  media_penyuluhan: {
    type: DataTypes.TEXT,
    comment: 'Media yang digunakan',
  },
  topik_konsultasi: {
    type: DataTypes.STRING(255),
    comment: 'Topik yang dikonsultasikan',
  },
  pemohon_konsultasi: {
    type: DataTypes.STRING(255),
    comment: 'Siapa yang konsultasi',
  },
  instansi_pemohon: {
    type: DataTypes.STRING(255),
    comment: 'Asal instansi',
  },
  permasalahan_konsultasi: {
    type: DataTypes.TEXT,
    comment: 'Masalah yang dikonsultasikan',
  },
  jawaban_konsultasi: {
    type: DataTypes.TEXT,
    comment: 'Jawaban/solusi yang diberikan',
  },
  output_kegiatan: {
    type: DataTypes.TEXT,
    comment: 'Output yang dihasilkan',
  },
  outcome_kegiatan: {
    type: DataTypes.TEXT,
    comment: 'Outcome yang dicapai',
  },
  evaluasi_kegiatan: {
    type: DataTypes.TEXT,
    comment: 'Evaluasi pelaksanaan',
  },
  tindak_lanjut: {
    type: DataTypes.TEXT,
    comment: 'Rencana tindak lanjut',
  },
  biaya_kegiatan: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Biaya pelaksanaan',
  },
  sumber_anggaran: {
    type: DataTypes.STRING(255),
    comment: 'APBD/APBN',
  },
  file_materi: {
    type: DataTypes.JSON,
    comment: 'Array file materi',
  },
  file_daftar_hadir: {
    type: DataTypes.STRING(255),
    comment: 'Daftar hadir',
  },
  file_dokumentasi: {
    type: DataTypes.JSON,
    comment: 'Foto dokumentasi',
  },
  file_laporan: {
    type: DataTypes.STRING(255),
    comment: 'Laporan kegiatan',
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
    defaultValue: 'Biasa',
    comment: 'Data bimbingan biasa',
  },
  status: {
    type: DataTypes.ENUM('perencanaan', 'pelaksanaan', 'selesai'),
    allowNull: false,
    defaultValue: 'perencanaan',
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
  tableName: 'bks_bmb',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default BksBmb;
