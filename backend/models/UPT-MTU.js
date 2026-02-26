// =====================================================
// MODEL: UptMtu
// TABLE: upt_mtu
// MODULE: UPT-MTU
// Generated: 2026-02-17T19:24:47.473Z
// =====================================================

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const UptMtu = sequelize.define('UptMtu', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  layanan_id: {
    type: DataTypes.STRING(10),
    allowNull: false,
    comment: 'FK ke layanan_menpanrb (LY161-LY176)',
  },
  jenis_layanan_mutu: {
    type: DataTypes.ENUM('Penjaminan Mutu', 'Verifikasi Kepatuhan', 'Pengendalian Mutu', 'Pengelolaan Temuan', 'Penyusunan SOP', 'Review SOP', 'Standar Layanan', 'Sosialisasi', 'Pelatihan Auditor', 'Sertifikasi Auditor', 'Evaluasi Auditor', 'Database Auditor', 'Supervisi Audit', 'Evaluasi Sertifikasi', 'Rekomendasi Mutu', 'Laporan Mutu'),
    allowNull: false,
    comment: 'Jenis layanan manajemen mutu',
  },
  nomor_dokumen_mutu: {
    type: DataTypes.STRING(100),
    comment: 'Nomor dokumen mutu/SOP',
  },
  judul_dokumen: {
    type: DataTypes.STRING(255),
    comment: 'Judul SOP/dokumen mutu',
  },
  tanggal_dokumen: {
    type: DataTypes.DATEONLY,
    comment: 'Tanggal ditetapkan',
  },
  versi: {
    type: DataTypes.STRING(20),
    defaultValue: '1.0',
    comment: 'Versi dokumen',
  },
  status_dokumen: {
    type: DataTypes.ENUM('Draft', 'Review', 'Approved', 'Active', 'Obsolete'),
    comment: 'Status dokumen',
  },
  objek_verifikasi: {
    type: DataTypes.STRING(255),
    comment: 'Apa yang diverifikasi',
  },
  standar_kepatuhan: {
    type: DataTypes.STRING(255),
    comment: 'Standar yang harus dipenuhi (SNI ISO dll)',
  },
  hasil_verifikasi: {
    type: DataTypes.ENUM('Sesuai', 'Tidak Sesuai', 'Perlu Perbaikan'),
    comment: 'Hasil verifikasi',
  },
  catatan_verifikasi: {
    type: DataTypes.TEXT,
    comment: 'Catatan hasil verifikasi',
  },
  jenis_audit_mutu: {
    type: DataTypes.ENUM('Audit Internal', 'Audit Eksternal', 'Surveillance', 'Witnessing'),
    comment: 'Jenis audit mutu',
  },
  tanggal_audit_mutu: {
    type: DataTypes.DATEONLY,
    comment: 'Tanggal audit mutu',
  },
  auditor_mutu: {
    type: DataTypes.STRING(255),
    comment: 'Nama auditor mutu',
  },
  hasil_audit_mutu: {
    type: DataTypes.TEXT,
    comment: 'Hasil audit mutu',
  },
  temuan_mayor: {
    type: DataTypes.TEXT,
    comment: 'Temuan mayor (critical)',
  },
  temuan_minor: {
    type: DataTypes.TEXT,
    comment: 'Temuan minor',
  },
  observasi: {
    type: DataTypes.TEXT,
    comment: 'Catatan observasi',
  },
  tindakan_korektif_mutu: {
    type: DataTypes.TEXT,
    comment: 'Tindakan perbaikan',
  },
  penanggung_jawab_perbaikan: {
    type: DataTypes.STRING(255),
    comment: 'Penanggung jawab tindakan korektif',
  },
  batas_waktu_perbaikan_mutu: {
    type: DataTypes.DATEONLY,
    comment: 'Deadline perbaikan',
  },
  status_perbaikan: {
    type: DataTypes.ENUM('Open', 'In Progress', 'Closed', 'Verified'),
    comment: 'Status tindakan korektif',
  },
  kode_sop: {
    type: DataTypes.STRING(50),
    comment: 'Kode SOP',
  },
  nama_sop: {
    type: DataTypes.STRING(255),
    comment: 'Nama/judul SOP',
  },
  lingkup_sop: {
    type: DataTypes.TEXT,
    comment: 'Ruang lingkup SOP',
  },
  tujuan_sop: {
    type: DataTypes.TEXT,
    comment: 'Tujuan SOP',
  },
  definisi: {
    type: DataTypes.TEXT,
    comment: 'Definisi istilah',
  },
  prosedur: {
    type: DataTypes.TEXT,
    comment: 'Langkah-langkah prosedur',
  },
  flowchart: {
    type: DataTypes.STRING(255),
    comment: 'File flowchart (PNG/PDF)',
  },
  formulir_terkait: {
    type: DataTypes.TEXT,
    comment: 'Formulir yang digunakan',
  },
  dokumen_terkait: {
    type: DataTypes.TEXT,
    comment: 'Dokumen referensi',
  },
  tanggal_review: {
    type: DataTypes.DATEONLY,
    comment: 'Tanggal review SOP',
  },
  reviewer: {
    type: DataTypes.STRING(255),
    comment: 'Nama reviewer',
  },
  hasil_review: {
    type: DataTypes.TEXT,
    comment: 'Hasil review SOP',
  },
  perubahan_yang_dilakukan: {
    type: DataTypes.TEXT,
    comment: 'Perubahan yang dilakukan',
  },
  alasan_perubahan: {
    type: DataTypes.TEXT,
    comment: 'Alasan revisi SOP',
  },
  jenis_standar_layanan: {
    type: DataTypes.ENUM('Persyaratan', 'Prosedur', 'Waktu', 'Biaya', 'Produk', 'Kompetensi', 'Sarana'),
    comment: 'Komponen standar layanan publik',
  },
  isi_standar: {
    type: DataTypes.TEXT,
    comment: 'Isi standar layanan',
  },
  metode_sosialisasi: {
    type: DataTypes.ENUM('Workshop', 'Rapat', 'Presentasi', 'Leaflet', 'Online'),
    comment: 'Metode sosialisasi SOP',
  },
  tanggal_sosialisasi: {
    type: DataTypes.DATEONLY,
    comment: 'Tanggal sosialisasi',
  },
  peserta_sosialisasi: {
    type: DataTypes.INTEGER,
    comment: 'Jumlah peserta',
  },
  materi_sosialisasi: {
    type: DataTypes.STRING(255),
    comment: 'File materi sosialisasi',
  },
  nama_pelatihan: {
    type: DataTypes.STRING(255),
    comment: 'Nama pelatihan auditor',
  },
  jenis_pelatihan: {
    type: DataTypes.ENUM('Basic Auditor', 'Lead Auditor', 'Refreshment', 'Advance'),
    comment: 'Jenis pelatihan',
  },
  tanggal_pelatihan: {
    type: DataTypes.DATEONLY,
    comment: 'Tanggal pelaksanaan',
  },
  durasi_pelatihan: {
    type: DataTypes.INTEGER,
    comment: 'Lama pelatihan',
  },
  trainer: {
    type: DataTypes.STRING(255),
    comment: 'Nama trainer/instruktur',
  },
  peserta_pelatihan: {
    type: DataTypes.TEXT,
    comment: 'Daftar peserta',
  },
  materi_pelatihan: {
    type: DataTypes.TEXT,
    comment: 'Materi yang diajarkan',
  },
  hasil_evaluasi_pelatihan: {
    type: DataTypes.TEXT,
    comment: 'Hasil evaluasi pelatihan',
  },
  auditor_id: {
    type: DataTypes.INTEGER,
    comment: 'FK ke database auditor',
  },
  nama_auditor: {
    type: DataTypes.STRING(255),
    comment: 'Nama lengkap auditor',
  },
  nip_auditor: {
    type: DataTypes.STRING(18),
    comment: 'NIP jika ASN',
  },
  sertifikat_auditor: {
    type: DataTypes.STRING(255),
    comment: 'Nomor sertifikat auditor',
  },
  jenis_sertifikat_auditor: {
    type: DataTypes.ENUM('Basic Auditor', 'Lead Auditor', 'Auditor GMP', 'Auditor HACCP', 'Lainnya'),
    comment: 'Jenis sertifikat',
  },
  tanggal_sertifikat: {
    type: DataTypes.DATEONLY,
    comment: 'Tanggal sertifikat diterbitkan',
  },
  masa_berlaku_auditor: {
    type: DataTypes.DATEONLY,
    comment: 'Tanggal kadaluarsa sertifikat',
  },
  lembaga_penerbit: {
    type: DataTypes.STRING(255),
    comment: 'Lembaga yang menerbitkan sertifikat',
  },
  kompetensi_auditor: {
    type: DataTypes.TEXT,
    comment: 'Daftar kompetensi auditor',
  },
  jumlah_audit_dilakukan: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Total audit yang dilakukan',
  },
  status_auditor: {
    type: DataTypes.ENUM('Aktif', 'Nonaktif', 'Expired'),
    defaultValue: 'Aktif',
    comment: 'Status auditor',
  },
  jenis_evaluasi_auditor: {
    type: DataTypes.ENUM('Evaluasi Kinerja', 'Evaluasi Kompetensi', 'Evaluasi Post Training'),
    comment: 'Jenis evaluasi auditor',
  },
  tanggal_evaluasi_auditor: {
    type: DataTypes.DATEONLY,
    comment: 'Tanggal evaluasi',
  },
  skor_evaluasi: {
    type: DataTypes.DECIMAL(5,2),
    comment: 'Skor hasil evaluasi',
  },
  hasil_evaluasi_auditor: {
    type: DataTypes.ENUM('Sangat Baik', 'Baik', 'Cukup', 'Kurang'),
    comment: 'Hasil evaluasi',
  },
  rekomendasi_evaluasi: {
    type: DataTypes.TEXT,
    comment: 'Rekomendasi hasil evaluasi',
  },
  tanggal_supervisi: {
    type: DataTypes.DATEONLY,
    comment: 'Tanggal supervisi audit lapangan',
  },
  lokasi_supervisi: {
    type: DataTypes.STRING(255),
    comment: 'Lokasi supervisi',
  },
  supervisor: {
    type: DataTypes.STRING(255),
    comment: 'Nama supervisor',
  },
  auditor_disupervisi: {
    type: DataTypes.STRING(255),
    comment: 'Auditor yang disupervisi',
  },
  temuan_supervisi: {
    type: DataTypes.TEXT,
    comment: 'Temuan hasil supervisi',
  },
  rekomendasi_supervisi: {
    type: DataTypes.TEXT,
    comment: 'Rekomendasi perbaikan',
  },
  periode_evaluasi: {
    type: DataTypes.DATEONLY,
    comment: 'Periode evaluasi sertifikasi',
  },
  total_sertifikasi_periode: {
    type: DataTypes.INTEGER,
    comment: 'Total sertifikasi dalam periode',
  },
  lulus_sertifikasi: {
    type: DataTypes.INTEGER,
    comment: 'Jumlah yang lulus',
  },
  tidak_lulus: {
    type: DataTypes.INTEGER,
    comment: 'Jumlah tidak lulus',
  },
  persentase_kelulusan_sertifikasi: {
    type: DataTypes.DECIMAL(5,2),
    comment: 'Auto-calculate',
  },
  analisis_evaluasi: {
    type: DataTypes.TEXT,
    comment: 'Analisis hasil evaluasi',
  },
  jenis_rekomendasi: {
    type: DataTypes.ENUM('Rekomendasi Perbaikan Sistem', 'Rekomendasi Perbaikan Proses', 'Rekomendasi Pelatihan', 'Rekomendasi Investasi'),
    comment: 'Jenis rekomendasi',
  },
  isi_rekomendasi: {
    type: DataTypes.TEXT,
    comment: 'Rekomendasi perbaikan mutu',
  },
  ditujukan_kepada: {
    type: DataTypes.STRING(255),
    defaultValue: 'Kepala UPTD',
    comment: 'Kepada siapa rekomendasi',
  },
  status_rekomendasi: {
    type: DataTypes.ENUM('Open', 'In Progress', 'Closed'),
    defaultValue: 'Open',
    comment: 'Status rekomendasi',
  },
  periode_laporan_mutu: {
    type: DataTypes.DATEONLY,
    comment: 'Periode laporan mutu',
  },
  indikator_mutu: {
    type: DataTypes.TEXT,
    comment: 'Indikator mutu layanan',
  },
  capaian_mutu: {
    type: DataTypes.TEXT,
    comment: 'Capaian indikator mutu',
  },
  persentase_kepuasan_pelanggan: {
    type: DataTypes.DECIMAL(5,2),
    comment: 'Hasil survei kepuasan',
  },
  temuan_mutu_periode: {
    type: DataTypes.INTEGER,
    comment: 'Total temuan dalam periode',
  },
  temuan_diselesaikan: {
    type: DataTypes.INTEGER,
    comment: 'Temuan yang sudah ditindaklanjuti',
  },
  ringkasan_laporan_mutu: {
    type: DataTypes.TEXT,
    comment: 'Ringkasan laporan mutu',
  },
  file_sop: {
    type: DataTypes.STRING(255),
    comment: 'Upload SOP PDF',
  },
  file_flowchart: {
    type: DataTypes.STRING(255),
    comment: 'Upload flowchart',
  },
  file_dokumen_mutu: {
    type: DataTypes.STRING(255),
    comment: 'Upload dokumen mutu',
  },
  file_sertifikat_auditor: {
    type: DataTypes.STRING(255),
    comment: 'Upload sertifikat auditor',
  },
  file_laporan_mutu: {
    type: DataTypes.STRING(255),
    comment: 'Upload laporan mutu',
  },
  file_materi: {
    type: DataTypes.JSON,
    comment: 'Array file materi pelatihan',
  },
  rincian_layanan: {
    type: DataTypes.TEXT,
    comment: 'Detail layanan',
  },
  penanggung_jawab: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: 'Kasi Manajemen Mutu',
    comment: 'PIC',
  },
  pelaksana: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Yang melaksanakan',
  },
  kelompok_penerima: {
    type: DataTypes.STRING(255),
    defaultValue: 'Internal UPTD',
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
    comment: 'Data mutu sensitif (kecuali sosialisasi & pelatihan)',
  },
  status: {
    type: DataTypes.ENUM('draft', 'review', 'approved', 'active'),
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
  tableName: 'upt_mtu',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default UptMtu;
