// =====================================================
// MODEL: BksKbj
// TABLE: bks_kbj
// MODULE: BKS-KBJ
// Generated: 2026-02-17T19:24:47.457Z
// =====================================================

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const BksKbj = sequelize.define('BksKbj', {
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
    comment: 'FK ke layanan_menpanrb (LY107-LY111)',
  },
  jenis_kebijakan: {
    type: DataTypes.ENUM('Kebijakan Konsumsi', 'Pedoman B2SA', 'Penganekaragaman Pangan', 'Sinkronisasi', 'Rekomendasi Intervensi'),
    allowNull: false,
    comment: 'Jenis kebijakan',
  },
  nomor_dokumen: {
    type: DataTypes.STRING(100),
    comment: 'Nomor dokumen kebijakan',
  },
  tanggal_dokumen: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Tanggal ditetapkan',
  },
  periode: {
    type: DataTypes.STRING(50),
    comment: 'Periode berlaku',
  },
  tahun: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Tahun',
  },
  judul_kebijakan: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Judul dokumen',
  },
  latar_belakang: {
    type: DataTypes.TEXT,
    comment: 'Background kebijakan',
  },
  ruang_lingkup: {
    type: DataTypes.TEXT,
    comment: 'Cakupan kebijakan',
  },
  tujuan: {
    type: DataTypes.TEXT,
    comment: 'Tujuan kebijakan',
  },
  sasaran: {
    type: DataTypes.TEXT,
    comment: 'Sasaran yang ingin dicapai',
  },
  prinsip_b2sa: {
    type: DataTypes.TEXT,
    comment: 'Beragam Bergizi Seimbang Aman',
  },
  pedoman_b2sa: {
    type: DataTypes.TEXT,
    comment: 'Pedoman konsumsi B2SA',
  },
  skor_pph_target: {
    type: DataTypes.DECIMAL(5,2),
    defaultValue: 90,
    comment: 'Target Skor Pola Pangan Harapan',
  },
  strategi_penganekaragaman: {
    type: DataTypes.TEXT,
    comment: 'Strategi diversifikasi konsumsi',
  },
  pangan_lokal_prioritas: {
    type: DataTypes.TEXT,
    comment: 'Pangan lokal yang diprioritaskan',
  },
  target_konsumsi_lokal: {
    type: DataTypes.TEXT,
    comment: 'Target konsumsi pangan lokal',
  },
  intervensi_konsumsi: {
    type: DataTypes.TEXT,
    comment: 'Jenis intervensi konsumsi',
  },
  kelompok_sasaran: {
    type: DataTypes.TEXT,
    comment: 'Sasaran intervensi',
  },
  wilayah_prioritas: {
    type: DataTypes.TEXT,
    comment: 'Wilayah prioritas intervensi',
  },
  koordinasi_dengan: {
    type: DataTypes.TEXT,
    comment: 'Instansi yang terlibat',
  },
  hasil_sinkronisasi: {
    type: DataTypes.TEXT,
    comment: 'Hasil sinkronisasi pusat-daerah',
  },
  rekomendasi: {
    type: DataTypes.TEXT,
    comment: 'Rekomendasi kebijakan',
  },
  indikator_keberhasilan: {
    type: DataTypes.TEXT,
    comment: 'Indikator keberhasilan',
  },
  target_capaian: {
    type: DataTypes.TEXT,
    comment: 'Target yang ingin dicapai',
  },
  dasar_hukum: {
    type: DataTypes.TEXT,
    comment: 'Landasan hukum',
  },
  tindak_lanjut: {
    type: DataTypes.TEXT,
    comment: 'Rencana tindak lanjut',
  },
  file_dokumen: {
    type: DataTypes.STRING(255),
    comment: 'Upload dokumen kebijakan PDF',
  },
  file_lampiran: {
    type: DataTypes.JSON,
    comment: 'Array file lampiran',
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
    comment: 'Siapa yang menerima',
  },
  jenis_data: {
    type: DataTypes.STRING(255),
    comment: 'Jenis data',
  },
  is_sensitive: {
    type: DataTypes.ENUM('Biasa', 'Sensitif'),
    allowNull: false,
    defaultValue: 'Sensitif',
    comment: 'Semua kebijakan sensitif',
  },
  status: {
    type: DataTypes.ENUM('draft', 'review', 'finalisasi', 'disetujui', 'final'),
    allowNull: false,
    defaultValue: 'draft',
    comment: 'Status dokumen',
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
  tableName: 'bks_kbj',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default BksKbj;
