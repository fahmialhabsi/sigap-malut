// =====================================================
// MODEL: SekHum
// TABLE: sek_hum
// MODULE: SEK-HUM
// Generated: 2026-02-17T19:24:47.380Z
// =====================================================

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SekHum = sequelize.define('SekHum', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  layanan_id: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: 'FK ke layanan_menpanrb (LY035-LY039)',
  },
  jenis_layanan_humas: {
    type: DataTypes.ENUM('Protokol', 'Acara Resmi', 'Penerimaan Tamu', 'Publikasi', 'Dokumentasi'),
    allowNull: false,
    comment: 'Jenis layanan humas',
  },
  nama_kegiatan: {
    type: DataTypes.STRING(255),
    comment: 'Nama acara/kegiatan',
  },
  jenis_acara: {
    type: DataTypes.ENUM('Rapat', 'Upacara', 'Kunjungan', 'Sosialisasi', 'Workshop', 'Launching', 'Lainnya'),
    comment: 'Jenis acara',
  },
  tanggal_acara: {
    type: DataTypes.DATEONLY,
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
    comment: 'Lokasi acara',
  },
  pimpinan_hadir: {
    type: DataTypes.STRING(255),
    comment: 'Pimpinan yang hadir',
  },
  tamu_vip: {
    type: DataTypes.TEXT,
    comment: 'Daftar tamu VIP',
  },
  jumlah_peserta: {
    type: DataTypes.INTEGER,
    comment: 'Total peserta',
  },
  rundown_acara: {
    type: DataTypes.TEXT,
    comment: 'Susunan acara',
  },
  mc: {
    type: DataTypes.STRING(255),
    comment: 'Pembawa acara',
  },
  protokoler: {
    type: DataTypes.STRING(255),
    comment: 'Petugas protokol',
  },
  nama_tamu: {
    type: DataTypes.STRING(255),
    comment: 'Untuk penerimaan tamu',
  },
  instansi_tamu: {
    type: DataTypes.STRING(255),
    comment: 'Asal instansi tamu',
  },
  keperluan_kunjungan: {
    type: DataTypes.TEXT,
    comment: 'Maksud kunjungan',
  },
  penerima_tamu: {
    type: DataTypes.STRING(255),
    comment: 'Pejabat yang menerima',
  },
  judul_publikasi: {
    type: DataTypes.STRING(255),
    comment: 'Judul berita/publikasi',
  },
  jenis_publikasi: {
    type: DataTypes.ENUM('Berita', 'Press Release', 'Artikel', 'Video', 'Foto', 'Infografis'),
    comment: 'Jenis publikasi',
  },
  media_publikasi: {
    type: DataTypes.ENUM('Website', 'Media Sosial', 'Media Massa', 'Buletin', 'Lainnya'),
    comment: 'Media yang digunakan',
  },
  link_publikasi: {
    type: DataTypes.STRING(255),
    comment: 'URL publikasi',
  },
  isi_publikasi: {
    type: DataTypes.TEXT,
    comment: 'Konten publikasi',
  },
  fotografer: {
    type: DataTypes.STRING(255),
    comment: 'Nama fotografer',
  },
  videografer: {
    type: DataTypes.STRING(255),
    comment: 'Nama videografer',
  },
  jumlah_foto: {
    type: DataTypes.INTEGER,
    comment: 'Total foto dihasilkan',
  },
  jumlah_video: {
    type: DataTypes.INTEGER,
    comment: 'Total video dihasilkan',
  },
  file_foto: {
    type: DataTypes.JSON,
    comment: 'Array path foto',
  },
  file_video: {
    type: DataTypes.JSON,
    comment: 'Array path video',
  },
  file_rundown: {
    type: DataTypes.STRING(255),
    comment: 'Upload rundown PDF',
  },
  file_undangan: {
    type: DataTypes.STRING(255),
    comment: 'Surat undangan',
  },
  penanggung_jawab: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: 'Kasubbag Umum',
    comment: 'PIC',
  },
  pelaksana: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Yang melaksanakan',
  },
  is_sensitive: {
    type: DataTypes.ENUM('Biasa', 'Sensitif'),
    allowNull: false,
    defaultValue: 'Biasa',
    comment: 'Klasifikasi data',
  },
  status: {
    type: DataTypes.ENUM('pending', 'persiapan', 'berlangsung', 'selesai'),
    allowNull: false,
    defaultValue: 'pending',
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
  tableName: 'sek_hum',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default SekHum;
