// =====================================================
// MODEL: UptTkn
// TABLE: upt_tkn
// MODULE: UPT-TKN
// Generated: 2026-02-17T19:24:47.474Z
// =====================================================

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const UptTkn = sequelize.define('UptTkn', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  layanan_id: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: 'FK ke layanan_menpanrb (LY132-LY135)',
  },
  jenis_layanan_teknis: {
    type: DataTypes.ENUM('Pengujian Sampel Pangan Berisiko', 'Hasil Pengujian GMP/GHP/NKV', 'Audit Produk', 'Pelaporan Teknis'),
    allowNull: false,
    comment: 'Jenis layanan teknis',
  },
  nomor_pengujian: {
    type: DataTypes.STRING(100),
    comment: 'Nomor registrasi pengujian',
  },
  nomor_audit: {
    type: DataTypes.STRING(100),
    comment: 'Nomor audit',
  },
  tanggal_pengujian: {
    type: DataTypes.DATEONLY,
    comment: 'Tanggal pengujian dilakukan',
  },
  pemohon: {
    type: DataTypes.STRING(255),
    comment: 'Nama pemohon uji/audit',
  },
  instansi_pemohon: {
    type: DataTypes.STRING(255),
    comment: 'Asal instansi',
  },
  jenis_sampel: {
    type: DataTypes.STRING(255),
    comment: 'Jenis sampel pangan',
  },
  jumlah_sampel: {
    type: DataTypes.INTEGER,
    comment: 'Jumlah sampel yang diuji',
  },
  parameter_uji: {
    type: DataTypes.TEXT,
    comment: 'Parameter yang diuji (kimia mikrobiologi fisik)',
  },
  metode_uji: {
    type: DataTypes.STRING(255),
    comment: 'Metode pengujian yang digunakan',
  },
  hasil_uji: {
    type: DataTypes.TEXT,
    comment: 'Hasil pengujian',
  },
  kesimpulan_uji: {
    type: DataTypes.ENUM('Memenuhi Syarat', 'Tidak Memenuhi Syarat', 'Perlu Uji Lanjutan'),
    comment: 'Kesimpulan hasil uji',
  },
  rekomendasi_uji: {
    type: DataTypes.TEXT,
    comment: 'Rekomendasi tindak lanjut',
  },
  standar_acuan: {
    type: DataTypes.STRING(255),
    comment: 'Standar yang digunakan (SNI dll)',
  },
  analis: {
    type: DataTypes.STRING(255),
    comment: 'Nama analis laboratorium',
  },
  verifikator: {
    type: DataTypes.STRING(255),
    comment: 'Nama verifikator hasil',
  },
  tanggal_verifikasi: {
    type: DataTypes.DATEONLY,
    comment: 'Tanggal verifikasi',
  },
  jenis_sertifikasi: {
    type: DataTypes.ENUM('GMP', 'GHP', 'NKV', 'Prima 1', 'Prima 2', 'Prima 3', 'GFP', 'Lainnya'),
    comment: 'Jenis sertifikasi',
  },
  nama_usaha: {
    type: DataTypes.STRING(255),
    comment: 'Nama usaha yang diaudit',
  },
  jenis_usaha: {
    type: DataTypes.STRING(255),
    comment: 'Jenis usaha pangan',
  },
  alamat_usaha: {
    type: DataTypes.TEXT,
    comment: 'Alamat lokasi usaha',
  },
  pemilik_usaha: {
    type: DataTypes.STRING(255),
    comment: 'Nama pemilik',
  },
  kontak_usaha: {
    type: DataTypes.STRING(50),
    comment: 'Nomor telepon/HP',
  },
  tanggal_audit: {
    type: DataTypes.DATEONLY,
    comment: 'Tanggal audit dilakukan',
  },
  tim_auditor: {
    type: DataTypes.TEXT,
    comment: 'Nama-nama tim auditor',
  },
  checklist_audit: {
    type: DataTypes.JSON,
    comment: 'JSON checklist audit',
  },
  skor_audit: {
    type: DataTypes.DECIMAL(5,2),
    comment: 'Skor hasil audit',
  },
  hasil_audit: {
    type: DataTypes.ENUM('Lulus', 'Tidak Lulus', 'Lulus Bersyarat'),
    comment: 'Hasil audit',
  },
  catatan_audit: {
    type: DataTypes.TEXT,
    comment: 'Catatan hasil audit',
  },
  tindakan_korektif: {
    type: DataTypes.TEXT,
    comment: 'Tindakan korektif yang diperlukan',
  },
  batas_waktu_perbaikan: {
    type: DataTypes.DATEONLY,
    comment: 'Deadline perbaikan',
  },
  status_sertifikat: {
    type: DataTypes.ENUM('Proses', 'Diterbitkan', 'Ditolak', 'Dicabut'),
    comment: 'Status penerbitan sertifikat',
  },
  nomor_sertifikat: {
    type: DataTypes.STRING(100),
    comment: 'Nomor sertifikat yang diterbitkan',
  },
  tanggal_terbit_sertifikat: {
    type: DataTypes.DATEONLY,
    comment: 'Tanggal sertifikat diterbitkan',
  },
  masa_berlaku_sertifikat: {
    type: DataTypes.DATEONLY,
    comment: 'Tanggal kadaluarsa sertifikat',
  },
  jenis_produk_audit: {
    type: DataTypes.ENUM('Domestik', 'Impor'),
    comment: 'Produk domestik atau impor',
  },
  negara_asal: {
    type: DataTypes.STRING(100),
    defaultValue: 'Indonesia',
    comment: 'Negara asal produk (untuk impor)',
  },
  dokumen_pendukung: {
    type: DataTypes.JSON,
    comment: 'Array file dokumen (CoA invoice dll)',
  },
  periode_laporan: {
    type: DataTypes.DATEONLY,
    comment: 'Periode laporan teknis',
  },
  jenis_laporan: {
    type: DataTypes.ENUM('Bulanan', 'Triwulanan', 'Semesteran', 'Tahunan'),
    comment: 'Jenis laporan',
  },
  total_pengujian: {
    type: DataTypes.INTEGER,
    comment: 'Total pengujian dalam periode',
  },
  total_audit: {
    type: DataTypes.INTEGER,
    comment: 'Total audit dalam periode',
  },
  total_sertifikat: {
    type: DataTypes.INTEGER,
    comment: 'Total sertifikat diterbitkan',
  },
  persentase_kelulusan: {
    type: DataTypes.DECIMAL(5,2),
    comment: 'Persentase kelulusan uji/audit',
  },
  ringkasan_laporan: {
    type: DataTypes.TEXT,
    comment: 'Ringkasan laporan teknis',
  },
  file_hasil_uji: {
    type: DataTypes.STRING(255),
    comment: 'Upload hasil uji PDF',
  },
  file_sertifikat: {
    type: DataTypes.STRING(255),
    comment: 'Upload sertifikat PDF',
  },
  file_laporan_audit: {
    type: DataTypes.STRING(255),
    comment: 'Upload laporan audit',
  },
  file_laporan_teknis: {
    type: DataTypes.STRING(255),
    comment: 'Upload laporan teknis',
  },
  rincian_layanan: {
    type: DataTypes.TEXT,
    comment: 'Detail layanan',
  },
  penanggung_jawab: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: 'Kepala UPTD',
    comment: 'PIC',
  },
  pelaksana: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Yang melaksanakan',
  },
  kelompok_penerima: {
    type: DataTypes.STRING(255),
    comment: 'Siapa yang terima layanan',
  },
  jenis_data: {
    type: DataTypes.STRING(255),
    comment: 'Jenis data',
  },
  is_sensitive: {
    type: DataTypes.ENUM('Biasa', 'Sensitif'),
    allowNull: false,
    defaultValue: 'Sensitif',
    comment: 'Data teknis UPTD sensitif',
  },
  status: {
    type: DataTypes.ENUM('pending', 'proses', 'selesai', 'verifikasi', 'approved'),
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
  tableName: 'upt_tkn',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default UptTkn;
