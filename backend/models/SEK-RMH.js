// =====================================================
// MODEL: SekRmh
// TABLE: sek_rmh
// MODULE: SEK-RMH
// Generated: 2026-02-17T19:24:47.412Z
// =====================================================

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SekRmh = sequelize.define('SekRmh', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  layanan_id: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: 'FK ke layanan_menpanrb (LY007',
  },
  jenis_layanan_rumah_tangga: {
    type: DataTypes.ENUM('Perjalanan Dinas', 'Kebersihan', 'Keamanan', 'Fasilitas', 'Ruang Rapat', 'Kendaraan'),
    allowNull: false,
    comment: 'Jenis layanan RT',
  },
  nomor_sppd: {
    type: DataTypes.STRING(100),
    comment: 'Untuk perjalanan dinas',
  },
  nomor_st: {
    type: DataTypes.STRING(100),
    comment: 'Nomor Surat Tugas',
  },
  nama_pegawai: {
    type: DataTypes.STRING(255),
    comment: 'Yang perjalanan dinas',
  },
  nip_pegawai: {
    type: DataTypes.STRING(18),
    comment: 'NIP pegawai',
  },
  tujuan: {
    type: DataTypes.STRING(255),
    comment: 'Tujuan perjalanan',
  },
  keperluan: {
    type: DataTypes.TEXT,
    comment: 'Keperluan perjalanan',
  },
  tanggal_berangkat: {
    type: DataTypes.DATEONLY,
    comment: 'Berangkat',
  },
  tanggal_kembali: {
    type: DataTypes.DATEONLY,
    comment: 'Kembali',
  },
  lama_hari: {
    type: DataTypes.INTEGER,
    comment: 'Jumlah hari',
  },
  biaya_transport: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Biaya transportasi',
  },
  biaya_penginapan: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Biaya hotel',
  },
  uang_harian: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Per hari',
  },
  total_biaya: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Total perjalanan dinas',
  },
  area_kebersihan: {
    type: DataTypes.STRING(255),
    comment: 'Area yang dibersihkan',
  },
  jadwal_kebersihan: {
    type: DataTypes.ENUM('Harian', 'Mingguan', 'Bulanan'),
    comment: 'Jadwal kebersihan',
  },
  petugas_kebersihan: {
    type: DataTypes.STRING(255),
    comment: 'Petugas cleaning',
  },
  pos_keamanan: {
    type: DataTypes.STRING(100),
    comment: 'Pos security',
  },
  shift_keamanan: {
    type: DataTypes.ENUM('Pagi', 'Siang', 'Malam'),
    comment: 'Shift keamanan',
  },
  petugas_keamanan: {
    type: DataTypes.STRING(255),
    comment: 'Nama security',
  },
  jenis_fasilitas: {
    type: DataTypes.STRING(255),
    comment: 'AC printer dll',
  },
  kondisi_fasilitas: {
    type: DataTypes.ENUM('Baik', 'Rusak', 'Perlu Perbaikan'),
    defaultValue: 'Baik',
    comment: 'Kondisi fasilitas',
  },
  nama_ruang_rapat: {
    type: DataTypes.STRING(255),
    comment: 'Ruang rapat A/B/C',
  },
  kapasitas: {
    type: DataTypes.INTEGER,
    comment: 'Kapasitas orang',
  },
  tanggal_pemesanan: {
    type: DataTypes.DATEONLY,
    comment: 'Booking ruang rapat',
  },
  jam_mulai: {
    type: DataTypes.TIME,
    comment: 'Jam mulai pakai',
  },
  jam_selesai: {
    type: DataTypes.TIME,
    comment: 'Jam selesai pakai',
  },
  pemesan: {
    type: DataTypes.STRING(255),
    comment: 'Yang memesan',
  },
  nomor_polisi: {
    type: DataTypes.STRING(20),
    comment: 'Kendaraan dinas',
  },
  jenis_kendaraan: {
    type: DataTypes.ENUM('Mobil Dinas', 'Motor Dinas', 'Mobil Operasional'),
    comment: 'Jenis kendaraan',
  },
  driver: {
    type: DataTypes.STRING(255),
    comment: 'Nama driver',
  },
  tanggal_pakai: {
    type: DataTypes.DATEONLY,
    comment: 'Tanggal kendaraan dipakai',
  },
  km_awal: {
    type: DataTypes.INTEGER,
    comment: 'Odometer awal',
  },
  km_akhir: {
    type: DataTypes.INTEGER,
    comment: 'Odometer akhir',
  },
  bbm_liter: {
    type: DataTypes.DECIMAL(10,2),
    comment: 'Pengisian BBM',
  },
  file_sppd: {
    type: DataTypes.STRING(255),
    comment: 'Upload SPPD',
  },
  file_laporan: {
    type: DataTypes.STRING(255),
    comment: 'Laporan perjalanan dinas',
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
    comment: 'Klasifikasi (perjalanan dinas = sensitif)',
  },
  status: {
    type: DataTypes.ENUM('pending', 'disetujui', 'ditolak', 'selesai'),
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
  tableName: 'sek_rmh',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default SekRmh;
