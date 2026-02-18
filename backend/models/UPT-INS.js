// =====================================================
// MODEL: UptIns
// TABLE: upt_ins
// MODULE: UPT-INS
// Generated: 2026-02-17T19:24:47.468Z
// =====================================================

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const UptIns = sequelize.define('UptIns', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  layanan_id: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: 'FK ke layanan_menpanrb (LY177-LY190)',
  },
  jenis_layanan_inspeksi: {
    type: DataTypes.ENUM('Inspeksi Lapangan', 'Audit Sertifikasi', 'Audit Ulang', 'Pengambilan Sampel', 'Pengujian Mutu', 'Verifikasi Hasil Uji', 'Rekomendasi Pengawasan', 'Pembinaan', 'Koordinasi OPD', 'Monitoring Perbaikan', 'Penjadwalan', 'Pelaksanaan Lapangan', 'Pelaporan Teknis', 'Data Layanan'),
    allowNull: false,
    comment: 'Jenis layanan inspeksi',
  },
  nomor_inspeksi: {
    type: DataTypes.STRING(100),
    comment: 'Nomor registrasi inspeksi',
  },
  nomor_audit_ins: {
    type: DataTypes.STRING(100),
    comment: 'Nomor audit sertifikasi',
  },
  tanggal_inspeksi: {
    type: DataTypes.DATEONLY,
    comment: 'Tanggal inspeksi dilakukan',
  },
  lokasi_inspeksi: {
    type: DataTypes.STRING(255),
    comment: 'Lokasi inspeksi',
  },
  objek_inspeksi: {
    type: DataTypes.STRING(255),
    comment: 'Apa yang diinspeksi (UMKM pasar rumah makan dll)',
  },
  nama_usaha_inspeksi: {
    type: DataTypes.STRING(255),
    comment: 'Nama usaha yang diinspeksi',
  },
  pemilik_usaha_inspeksi: {
    type: DataTypes.STRING(255),
    comment: 'Nama pemilik',
  },
  alamat_inspeksi: {
    type: DataTypes.TEXT,
    comment: 'Alamat lokasi inspeksi',
  },
  tim_inspeksi: {
    type: DataTypes.TEXT,
    comment: 'Nama-nama tim inspeksi',
  },
  jenis_sertifikasi_audit: {
    type: DataTypes.ENUM('GMP', 'GHP', 'NKV', 'Prima 1', 'Prima 2', 'Prima 3', 'GFP', 'HACCP', 'Lainnya'),
    comment: 'Jenis sertifikasi yang diaudit',
  },
  audit_awal_ulang: {
    type: DataTypes.ENUM('Awal', 'Ulang', 'Surveillance'),
    defaultValue: 'Awal',
    comment: 'Audit awal atau ulang',
  },
  alasan_audit_ulang: {
    type: DataTypes.TEXT,
    comment: 'Alasan audit ulang',
  },
  checklist_inspeksi: {
    type: DataTypes.JSON,
    comment: 'JSON checklist inspeksi',
  },
  skor_inspeksi: {
    type: DataTypes.DECIMAL(5,2),
    comment: 'Skor hasil inspeksi',
  },
  hasil_inspeksi: {
    type: DataTypes.ENUM('Lulus', 'Tidak Lulus', 'Lulus Bersyarat'),
    comment: 'Hasil inspeksi',
  },
  temuan_inspeksi: {
    type: DataTypes.TEXT,
    comment: 'Temuan hasil inspeksi',
  },
  catatan_inspeksi: {
    type: DataTypes.TEXT,
    comment: 'Catatan inspeksi',
  },
  rekomendasi_inspeksi: {
    type: DataTypes.TEXT,
    comment: 'Rekomendasi tindak lanjut',
  },
  tindakan_korektif_inspeksi: {
    type: DataTypes.TEXT,
    comment: 'Tindakan perbaikan yang diperlukan',
  },
  batas_waktu_ins: {
    type: DataTypes.DATEONLY,
    comment: 'Deadline perbaikan',
  },
  jenis_sampel_pangan: {
    type: DataTypes.STRING(255),
    comment: 'Jenis sampel pangan',
  },
  lokasi_pengambilan: {
    type: DataTypes.STRING(255),
    comment: 'Lokasi pengambilan sampel',
  },
  tanggal_sampling: {
    type: DataTypes.DATEONLY,
    comment: 'Tanggal pengambilan sampel',
  },
  sampler: {
    type: DataTypes.STRING(255),
    comment: 'Nama petugas sampling',
  },
  jumlah_sampel_diambil: {
    type: DataTypes.INTEGER,
    comment: 'Jumlah sampel yang diambil',
  },
  metode_sampling: {
    type: DataTypes.STRING(255),
    comment: 'Metode pengambilan sampel',
  },
  kondisi_sampel: {
    type: DataTypes.ENUM('Baik', 'Rusak', 'Kadaluarsa'),
    defaultValue: 'Baik',
    comment: 'Kondisi sampel',
  },
  penyimpanan_sampel: {
    type: DataTypes.STRING(255),
    comment: 'Cara penyimpanan sampel',
  },
  nomor_sampel: {
    type: DataTypes.STRING(100),
    comment: 'Nomor identifikasi sampel',
  },
  parameter_pengujian: {
    type: DataTypes.TEXT,
    comment: 'Parameter yang diuji',
  },
  metode_pengujian: {
    type: DataTypes.STRING(255),
    comment: 'Metode pengujian',
  },
  analis_pengujian: {
    type: DataTypes.STRING(255),
    comment: 'Nama analis',
  },
  tanggal_pengujian_mulai: {
    type: DataTypes.DATEONLY,
    comment: 'Tanggal mulai uji',
  },
  tanggal_pengujian_selesai: {
    type: DataTypes.DATEONLY,
    comment: 'Tanggal selesai uji',
  },
  hasil_pengujian: {
    type: DataTypes.TEXT,
    comment: 'Hasil pengujian',
  },
  kesimpulan_pengujian: {
    type: DataTypes.ENUM('Memenuhi Syarat', 'Tidak Memenuhi Syarat'),
    comment: 'Kesimpulan hasil uji',
  },
  tanggal_verifikasi_uji: {
    type: DataTypes.DATEONLY,
    comment: 'Tanggal verifikasi hasil',
  },
  verifikator_uji: {
    type: DataTypes.STRING(255),
    comment: 'Nama verifikator',
  },
  hasil_verifikasi_uji: {
    type: DataTypes.ENUM('Approved', 'Rejected', 'Need Retest'),
    comment: 'Hasil verifikasi',
  },
  catatan_verifikasi_uji: {
    type: DataTypes.TEXT,
    comment: 'Catatan verifikasi',
  },
  jenis_rekomendasi_pengawasan: {
    type: DataTypes.ENUM('Rekomendasi Tindakan', 'Rekomendasi Sanksi', 'Rekomendasi Pembinaan', 'Rekomendasi Pemantauan'),
    comment: 'Jenis rekomendasi',
  },
  isi_rekomendasi_pengawasan: {
    type: DataTypes.TEXT,
    comment: 'Isi rekomendasi pengawasan',
  },
  tindak_lanjut_rekomendasi: {
    type: DataTypes.TEXT,
    comment: 'Tindak lanjut rekomendasi',
  },
  status_rekomendasi_pengawasan: {
    type: DataTypes.ENUM('Open', 'In Progress', 'Closed'),
    defaultValue: 'Open',
    comment: 'Status rekomendasi',
  },
  jenis_pembinaan: {
    type: DataTypes.ENUM('Pembinaan Langsung', 'Bimbingan Teknis', 'Konsultasi', 'Pelatihan', 'Lainnya'),
    comment: 'Jenis pembinaan',
  },
  tanggal_pembinaan: {
    type: DataTypes.DATEONLY,
    comment: 'Tanggal pembinaan',
  },
  lokasi_pembinaan: {
    type: DataTypes.STRING(255),
    comment: 'Lokasi pembinaan',
  },
  penerima_pembinaan: {
    type: DataTypes.STRING(255),
    comment: 'Yang dibina',
  },
  materi_pembinaan: {
    type: DataTypes.TEXT,
    comment: 'Materi yang diberikan',
  },
  hasil_pembinaan: {
    type: DataTypes.TEXT,
    comment: 'Hasil pembinaan',
  },
  opd_dikoordinasikan: {
    type: DataTypes.TEXT,
    comment: 'OPD yang dikoordinasikan (Dinkes BPOM dll)',
  },
  tanggal_koordinasi: {
    type: DataTypes.DATEONLY,
    comment: 'Tanggal rapat koordinasi',
  },
  topik_koordinasi_opd: {
    type: DataTypes.TEXT,
    comment: 'Topik rapat',
  },
  hasil_koordinasi_opd: {
    type: DataTypes.TEXT,
    comment: 'Hasil rapat koordinasi',
  },
  tindak_lanjut_koordinasi: {
    type: DataTypes.TEXT,
    comment: 'Tindak lanjut koordinasi',
  },
  objek_monitoring: {
    type: DataTypes.STRING(255),
    comment: 'Apa yang dimonitoring',
  },
  tanggal_monitoring: {
    type: DataTypes.DATEONLY,
    comment: 'Tanggal monitoring',
  },
  hasil_monitoring: {
    type: DataTypes.TEXT,
    comment: 'Hasil monitoring perbaikan',
  },
  status_perbaikan_monitoring: {
    type: DataTypes.ENUM('Belum', 'Proses', 'Selesai', 'Verified'),
    comment: 'Status perbaikan',
  },
  tanggal_penjadwalan: {
    type: DataTypes.DATEONLY,
    comment: 'Tanggal kegiatan dijadwalkan',
  },
  jenis_kegiatan_jadwal: {
    type: DataTypes.ENUM('Inspeksi', 'Audit', 'Sampling', 'Pengujian', 'Pembinaan', 'Monitoring'),
    comment: 'Jenis kegiatan yang dijadwalkan',
  },
  petugas_dijadwalkan: {
    type: DataTypes.TEXT,
    comment: 'Petugas yang dijadwalkan',
  },
  status_jadwal: {
    type: DataTypes.ENUM('Scheduled', 'Ongoing', 'Completed', 'Cancelled', 'Rescheduled'),
    defaultValue: 'Scheduled',
    comment: 'Status jadwal',
  },
  jenis_layanan_lapangan: {
    type: DataTypes.STRING(255),
    comment: 'Jenis layanan yang dilaksanakan',
  },
  tanggal_pelaksanaan: {
    type: DataTypes.DATEONLY,
    comment: 'Tanggal pelaksanaan',
  },
  lokasi_pelaksanaan: {
    type: DataTypes.STRING(255),
    comment: 'Lokasi pelaksanaan',
  },
  tim_pelaksana: {
    type: DataTypes.TEXT,
    comment: 'Tim yang melaksanakan',
  },
  hasil_pelaksanaan: {
    type: DataTypes.TEXT,
    comment: 'Hasil pelaksanaan',
  },
  periode_pelaporan_teknis: {
    type: DataTypes.DATEONLY,
    comment: 'Periode laporan teknis',
  },
  jenis_laporan_teknis: {
    type: DataTypes.ENUM('Bulanan', 'Triwulanan', 'Semesteran', 'Tahunan'),
    comment: 'Jenis laporan',
  },
  total_inspeksi: {
    type: DataTypes.INTEGER,
    comment: 'Total inspeksi dalam periode',
  },
  total_audit_teknis: {
    type: DataTypes.INTEGER,
    comment: 'Total audit dalam periode',
  },
  total_sampel_diambil: {
    type: DataTypes.INTEGER,
    comment: 'Total sampel diambil',
  },
  total_pengujian_teknis: {
    type: DataTypes.INTEGER,
    comment: 'Total pengujian dilakukan',
  },
  persentase_kelulusan_teknis: {
    type: DataTypes.DECIMAL(5,2),
    comment: 'Persentase kelulusan',
  },
  temuan_tidak_sesuai: {
    type: DataTypes.INTEGER,
    comment: 'Total temuan',
  },
  tindakan_pengawasan: {
    type: DataTypes.INTEGER,
    comment: 'Total tindakan pengawasan',
  },
  pembinaan_dilakukan: {
    type: DataTypes.INTEGER,
    comment: 'Total pembinaan',
  },
  ringkasan_laporan_teknis: {
    type: DataTypes.TEXT,
    comment: 'Ringkasan laporan teknis',
  },
  jenis_data_layanan: {
    type: DataTypes.ENUM('Data Inspeksi', 'Data Audit', 'Data Sampling', 'Data Pengujian', 'Data Sertifikasi', 'Data Pembinaan', 'Data Monitoring'),
    comment: 'Jenis data layanan',
  },
  periode_data: {
    type: DataTypes.DATEONLY,
    comment: 'Periode data',
  },
  format_data: {
    type: DataTypes.ENUM('Excel', 'PDF', 'CSV', 'JSON'),
    defaultValue: 'Excel',
    comment: 'Format data',
  },
  keterangan_data: {
    type: DataTypes.TEXT,
    comment: 'Keterangan data',
  },
  file_laporan_inspeksi: {
    type: DataTypes.STRING(255),
    comment: 'Upload laporan inspeksi',
  },
  file_laporan_audit_ins: {
    type: DataTypes.STRING(255),
    comment: 'Upload laporan audit',
  },
  file_hasil_pengujian: {
    type: DataTypes.STRING(255),
    comment: 'Upload hasil uji',
  },
  file_berita_acara: {
    type: DataTypes.STRING(255),
    comment: 'Upload BA sampling/inspeksi',
  },
  file_dokumentasi: {
    type: DataTypes.JSON,
    comment: 'Array foto dokumentasi',
  },
  file_laporan_teknis_ins: {
    type: DataTypes.STRING(255),
    comment: 'Upload laporan teknis',
  },
  file_data_layanan: {
    type: DataTypes.STRING(255),
    comment: 'Upload data layanan',
  },
  rincian_layanan: {
    type: DataTypes.TEXT,
    comment: 'Detail layanan',
  },
  penanggung_jawab: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: 'Kasi Manajemen Teknis',
    comment: 'PIC',
  },
  pelaksana: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Yang melaksanakan',
  },
  kelompok_penerima: {
    type: DataTypes.STRING(255),
    defaultValue: 'Pelaku Usaha/Masyarakat',
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
    comment: 'Data inspeksi sensitif (kecuali penjadwalan & pelaksanaan umum)',
  },
  status: {
    type: DataTypes.ENUM('pending', 'scheduled', 'ongoing', 'completed', 'verified'),
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
  tableName: 'upt_ins',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default UptIns;
