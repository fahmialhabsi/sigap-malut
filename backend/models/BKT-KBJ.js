// =====================================================
// MODEL: BktKbj
// TABLE: bkt_kbj
// MODULE: BKT-KBJ
// Generated: 2026-02-17T19:24:47.422Z
// =====================================================

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const BktKbj = sequelize.define('BktKbj', {
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
    comment: 'FK ke layanan_menpanrb (LY052-LY056)',
  },
  jenis_kebijakan: {
    type: DataTypes.ENUM('Analisis Ketersediaan', 'Rekomendasi', 'Penetapan Komoditas Strategis', 'Pedoman Teknis', 'Sinkronisasi Pusat-Daerah'),
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
  periode_analisis: {
    type: DataTypes.STRING(50),
    comment: 'Periode yang dianalisis',
  },
  tahun: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Tahun',
  },
  judul_kebijakan: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Judul dokumen kebijakan',
  },
  latar_belakang: {
    type: DataTypes.TEXT,
    comment: 'Background kebijakan',
  },
  ruang_lingkup: {
    type: DataTypes.TEXT,
    comment: 'Cakupan kebijakan',
  },
  data_ketersediaan: {
    type: DataTypes.TEXT,
    comment: 'Data ketersediaan pangan',
  },
  data_produksi: {
    type: DataTypes.TEXT,
    comment: 'Data produksi pangan',
  },
  data_pasokan: {
    type: DataTypes.TEXT,
    comment: 'Data pasokan pangan',
  },
  analisis_situasi: {
    type: DataTypes.TEXT,
    comment: 'Analisis kondisi saat ini',
  },
  permasalahan: {
    type: DataTypes.TEXT,
    comment: 'Masalah yang dihadapi',
  },
  opsi_solusi: {
    type: DataTypes.TEXT,
    comment: 'Alternatif solusi',
  },
  rekomendasi: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: 'Rekomendasi kebijakan',
  },
  komoditas_strategis: {
    type: DataTypes.JSON,
    comment: 'Array komoditas yang ditetapkan strategis',
  },
  target_pencapaian: {
    type: DataTypes.TEXT,
    comment: 'Target yang ingin dicapai',
  },
  indikator_keberhasilan: {
    type: DataTypes.TEXT,
    comment: 'Indikator keberhasilan kebijakan',
  },
  dasar_hukum: {
    type: DataTypes.TEXT,
    comment: 'Landasan hukum',
  },
  instansi_terkait: {
    type: DataTypes.TEXT,
    comment: 'Instansi yang terlibat',
  },
  koordinasi_dengan: {
    type: DataTypes.TEXT,
    comment: 'Koordinasi dengan siapa',
  },
  hasil_sinkronisasi: {
    type: DataTypes.TEXT,
    comment: 'Hasil sinkronisasi pusat-daerah',
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
    defaultValue: 'Kepala Bidang Ketersediaan',
    comment: 'PIC',
  },
  pelaksana: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Yang melaksanakan',
  },
  kelompok_penerima: {
    type: DataTypes.STRING(255),
    comment: 'Siapa yang menerima layanan',
  },
  jenis_data: {
    type: DataTypes.STRING(255),
    comment: 'Jenis data yang diproses',
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
  tableName: 'bkt_kbj',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default BktKbj;
