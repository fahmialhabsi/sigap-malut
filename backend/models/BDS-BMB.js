// =====================================================
// MODEL: BdsBmb
// TABLE: bds_bmb
// MODULE: BDS-BMB
// Generated: 2026-02-17T19:24:47.435Z
// =====================================================

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const BdsBmb = sequelize.define('BdsBmb', {
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
    comment: 'FK ke layanan_menpanrb (LY097-LY101)',
  },
  jenis_bimbingan: {
    type: DataTypes.ENUM('Bimtek Distribusi', 'Bimtek CPPD', 'Supervisi Lapangan', 'Konsultasi Teknis', 'Fasilitasi Stakeholder'),
    allowNull: false,
    comment: 'Jenis bimbingan',
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
    comment: 'Aparatur/pelaku usaha/masyarakat',
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
    type: DataTypes.ENUM('Tatap Muka', 'Online', 'Hybrid', 'Kunjungan Lapangan'),
    comment: 'Metode',
  },
  area_supervisi: {
    type: DataTypes.STRING(255),
    comment: 'Wilayah yang disupervisi',
  },
  objek_supervisi: {
    type: DataTypes.STRING(255),
    comment: 'Apa yang disupervisi (gudang/pasar/distribusi)',
  },
  temuan_supervisi: {
    type: DataTypes.TEXT,
    comment: 'Temuan saat supervisi',
  },
  rekomendasi_supervisi: {
    type: DataTypes.TEXT,
    comment: 'Rekomendasi perbaikan',
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
  stakeholder_difasilitasi: {
    type: DataTypes.TEXT,
    comment: 'Pihak-pihak yang difasilitasi',
  },
  topik_fasilitasi: {
    type: DataTypes.STRING(255),
    comment: 'Topik fasilitasi',
  },
  hasil_fasilitasi: {
    type: DataTypes.TEXT,
    comment: 'Hasil fasilitasi',
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
    defaultValue: 'Kepala Bidang Distribusi',
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
  tableName: 'bds_bmb',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default BdsBmb;
