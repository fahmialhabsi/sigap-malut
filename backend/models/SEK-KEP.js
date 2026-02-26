// =====================================================
// MODEL: SekKep
// TABLE: sek_kep
// MODULE: SEK-KEP
// Generated: 2026-02-17T19:24:47.388Z
// =====================================================

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const SekKep = sequelize.define('SekKep', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  layanan_id: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: 'FK ke layanan_menpanrb (LY008-LY015)',
  },
  asn_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'FK ke tabel asn',
  },
  nip: {
    type: DataTypes.STRING(18),
    allowNull: false,
    comment: 'Nomor Induk Pegawai',
  },
  nama_asn: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Denormalized dari tabel asn',
  },
  jenis_layanan_kepegawaian: {
    type: DataTypes.ENUM('Data Induk', 'Kenaikan Pangkat', 'Mutasi', 'Gaji Tunjangan', 'Cuti', 'Penilaian Kinerja', 'Disiplin', 'Pensiun'),
    allowNull: false,
    comment: 'Layanan kepegawaian spesifik',
  },
  pangkat_lama: {
    type: DataTypes.STRING(50),
    comment: 'Untuk kenaikan pangkat',
  },
  pangkat_baru: {
    type: DataTypes.STRING(50),
    comment: 'Untuk kenaikan pangkat',
  },
  golongan_lama: {
    type: DataTypes.STRING(10),
    comment: 'Untuk kenaikan pangkat',
  },
  golongan_baru: {
    type: DataTypes.STRING(10),
    comment: 'Untuk kenaikan pangkat',
  },
  jabatan_lama: {
    type: DataTypes.STRING(255),
    comment: 'Untuk mutasi',
  },
  jabatan_baru: {
    type: DataTypes.STRING(255),
    comment: 'Untuk mutasi',
  },
  tmt_kenaikan: {
    type: DataTypes.DATEONLY,
    comment: 'Terhitung Mulai Tanggal',
  },
  nomor_sk: {
    type: DataTypes.STRING(100),
    comment: 'Nomor SK kepegawaian',
  },
  tanggal_sk: {
    type: DataTypes.DATEONLY,
    comment: 'Tanggal SK ditetapkan',
  },
  jenis_cuti: {
    type: DataTypes.ENUM('Tahunan', 'Sakit', 'Besar', 'Melahirkan', 'Alasan Penting', 'Luar Tanggungan Negara'),
    comment: 'Untuk layanan cuti',
  },
  tanggal_mulai_cuti: {
    type: DataTypes.DATEONLY,
    comment: 'Tanggal mulai cuti',
  },
  tanggal_selesai_cuti: {
    type: DataTypes.DATEONLY,
    comment: 'Tanggal selesai cuti',
  },
  lama_cuti: {
    type: DataTypes.INTEGER,
    comment: 'Jumlah hari',
  },
  nilai_skp: {
    type: DataTypes.DECIMAL(5,2),
    comment: 'Nilai penilaian kinerja',
  },
  predikat_kinerja: {
    type: DataTypes.ENUM('Sangat Baik', 'Baik', 'Cukup', 'Kurang', 'Buruk'),
    comment: 'Predikat penilaian kinerja',
  },
  jenis_sanksi: {
    type: DataTypes.ENUM('Ringan', 'Sedang', 'Berat'),
    comment: 'Untuk disiplin & sanksi',
  },
  uraian_sanksi: {
    type: DataTypes.TEXT,
    comment: 'Deskripsi sanksi',
  },
  tanggal_pensiun: {
    type: DataTypes.DATEONLY,
    comment: 'Untuk pensiun',
  },
  jenis_pensiun: {
    type: DataTypes.ENUM('BUP (Batas Usia Pensiun)', 'Atas Permintaan Sendiri', 'Alasan Lain'),
    comment: 'Jenis pensiun',
  },
  gaji_pokok: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Untuk gaji & tunjangan',
  },
  total_tunjangan: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Untuk gaji & tunjangan',
  },
  file_sk: {
    type: DataTypes.STRING(255),
    comment: 'Upload SK PDF',
  },
  file_pendukung: {
    type: DataTypes.JSON,
    comment: 'Array file pendukung',
  },
  penanggung_jawab: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: 'Kasubbag Kepegawaian',
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
    defaultValue: 'Sensitif',
    comment: 'Semua data kepegawaian sensitif',
  },
  status: {
    type: DataTypes.ENUM('pending', 'proses', 'disetujui', 'ditolak', 'selesai'),
    allowNull: false,
    defaultValue: 'pending',
    comment: 'Status proses',
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
  tableName: 'sek_kep',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default SekKep;
