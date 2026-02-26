// =====================================================
// MODEL: SekAst
// TABLE: sek_ast
// MODULE: SEK-AST
// Generated: 2026-02-17T19:24:47.373Z
// =====================================================

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SekAst = sequelize.define('SekAst', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  unit_kerja: {
    type: DataTypes.ENUM('Sekretariat', 'UPTD', 'Bidang Ketersediaan', 'Bidang Distribusi', 'Bidang Konsumsi'),
    allowNull: false,
    defaultValue: 'Sekretariat',
    comment: 'Unit pengelola aset (BARU - untuk integrasi multi-unit)',
  },
  layanan_id: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: 'FK ke layanan_menpanrb (LY023-LY029)',
  },
  kode_aset: {
    type: DataTypes.STRING(50),
    comment: 'Kode barang milik daerah',
  },
  nama_aset: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Nama barang',
  },
  kategori_aset: {
    type: DataTypes.ENUM('Tanah', 'Peralatan dan Mesin', 'Gedung dan Bangunan', 'Jalan Irigasi dan Jaringan', 'Aset Tetap Lainnya', 'Konstruksi Dalam Pengerjaan'),
    allowNull: false,
    comment: 'Kategori aset',
  },
  merk_type: {
    type: DataTypes.STRING(255),
    comment: 'Merk dan tipe',
  },
  nomor_seri: {
    type: DataTypes.STRING(100),
    comment: 'Serial number',
  },
  tahun_perolehan: {
    type: DataTypes.INTEGER,
    comment: 'Tahun dapat aset',
  },
  cara_perolehan: {
    type: DataTypes.ENUM('Pembelian', 'Hibah', 'Donasi', 'Transfer', 'Lainnya'),
    comment: 'Cara dapat aset',
  },
  harga_perolehan: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Harga saat perolehan',
  },
  nilai_buku: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Nilai buku saat ini',
  },
  kondisi: {
    type: DataTypes.ENUM('Baik', 'Rusak Ringan', 'Rusak Berat'),
    allowNull: false,
    defaultValue: 'Baik',
    comment: 'Kondisi aset',
  },
  lokasi: {
    type: DataTypes.STRING(255),
    comment: 'Dimana aset berada',
  },
  ruangan: {
    type: DataTypes.STRING(100),
    comment: 'Ruangan spesifik',
  },
  penanggung_jawab_aset: {
    type: DataTypes.STRING(255),
    comment: 'Pengguna aset',
  },
  qr_code: {
    type: DataTypes.STRING(255),
    comment: 'QR code untuk tracking',
  },
  tanggal_inventarisasi: {
    type: DataTypes.DATEONLY,
    comment: 'Terakhir inventarisasi',
  },
  tanggal_pemeliharaan_terakhir: {
    type: DataTypes.DATEONLY,
    comment: 'Tanggal pemeliharaan',
  },
  tanggal_pemeliharaan_berikutnya: {
    type: DataTypes.DATEONLY,
    comment: 'Jadwal pemeliharaan',
  },
  biaya_pemeliharaan: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Biaya maintenance',
  },
  jenis_pemeliharaan: {
    type: DataTypes.ENUM('Rutin', 'Berkala', 'Darurat'),
    comment: 'Jenis pemeliharaan',
  },
  status_aset: {
    type: DataTypes.ENUM('Aktif', 'Tidak Digunakan', 'Rusak', 'Dalam Perbaikan', 'Akan Dihapus', 'Dihapuskan'),
    allowNull: false,
    defaultValue: 'Aktif',
    comment: 'Status',
  },
  alasan_penghapusan: {
    type: DataTypes.TEXT,
    comment: 'Jika akan dihapus',
  },
  tanggal_penghapusan: {
    type: DataTypes.DATEONLY,
    comment: 'Tanggal SK penghapusan',
  },
  nomor_sk_penghapusan: {
    type: DataTypes.STRING(100),
    comment: 'SK penghapusan aset',
  },
  file_foto: {
    type: DataTypes.STRING(255),
    comment: 'Upload foto aset',
  },
  file_bast: {
    type: DataTypes.STRING(255),
    comment: 'Berita Acara Serah Terima',
  },
  file_sk: {
    type: DataTypes.STRING(255),
    comment: 'SK terkait aset',
  },
  penanggung_jawab: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: 'Kasubbag Umum',
    comment: 'PIC layanan',
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
  tableName: 'sek_ast',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default SekAst;
