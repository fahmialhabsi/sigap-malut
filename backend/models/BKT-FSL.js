// =====================================================
// MODEL: BktFsl
// TABLE: bkt_fsl
// MODULE: BKT-FSL
// Generated: 2026-02-17T19:24:47.420Z
// =====================================================

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const BktFsl = sequelize.define('BktFsl', {
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
    defaultValue: 'LY066',
    comment: 'FK ke layanan_menpanrb',
  },
  jenis_fasilitasi: {
    type: DataTypes.ENUM('Intervensi Produksi', 'Intervensi Distribusi', 'Intervensi Konsumsi', 'Bantuan Pangan', 'Lainnya'),
    allowNull: false,
    comment: 'Jenis fasilitasi',
  },
  nama_program: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Nama program intervensi',
  },
  periode: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Periode pelaksanaan',
  },
  tahun: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Tahun',
  },
  wilayah_sasaran: {
    type: DataTypes.STRING(255),
    comment: 'Kabupaten/kecamatan sasaran',
  },
  kelompok_sasaran: {
    type: DataTypes.STRING(255),
    comment: 'Petani/nelayan/masyarakat',
  },
  jumlah_penerima: {
    type: DataTypes.INTEGER,
    comment: 'Total penerima manfaat',
  },
  jenis_intervensi: {
    type: DataTypes.ENUM('Bantuan Benih', 'Bantuan Pupuk', 'Bantuan Alat', 'Bantuan Pangan', 'Pelatihan', 'Pendampingan', 'Lainnya'),
    comment: 'Jenis intervensi',
  },
  volume_bantuan: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Volume bantuan',
  },
  satuan: {
    type: DataTypes.STRING(50),
    comment: 'Satuan (kg ton unit dll)',
  },
  nilai_bantuan: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Nilai dalam rupiah',
  },
  sumber_bantuan: {
    type: DataTypes.STRING(255),
    comment: 'APBN/APBD/Donor/Lainnya',
  },
  instansi_pemberi: {
    type: DataTypes.STRING(255),
    comment: 'Instansi pemberi bantuan',
  },
  tanggal_penyaluran: {
    type: DataTypes.DATEONLY,
    comment: 'Kapan disalurkan',
  },
  lokasi_penyaluran: {
    type: DataTypes.STRING(255),
    comment: 'Dimana disalurkan',
  },
  penanggung_jawab_penyaluran: {
    type: DataTypes.STRING(255),
    comment: 'PIC penyaluran',
  },
  target_output: {
    type: DataTypes.TEXT,
    comment: 'Output yang diharapkan',
  },
  target_outcome: {
    type: DataTypes.TEXT,
    comment: 'Outcome yang diharapkan',
  },
  realisasi: {
    type: DataTypes.TEXT,
    comment: 'Realisasi pelaksanaan',
  },
  kendala: {
    type: DataTypes.TEXT,
    comment: 'Kendala yang dihadapi',
  },
  solusi: {
    type: DataTypes.TEXT,
    comment: 'Solusi atas kendala',
  },
  dampak: {
    type: DataTypes.TEXT,
    comment: 'Dampak yang dirasakan',
  },
  dokumentasi_kegiatan: {
    type: DataTypes.JSON,
    comment: 'Array foto kegiatan',
  },
  file_proposal: {
    type: DataTypes.STRING(255),
    comment: 'Proposal program',
  },
  file_bast: {
    type: DataTypes.STRING(255),
    comment: 'Berita Acara Serah Terima',
  },
  file_laporan: {
    type: DataTypes.STRING(255),
    comment: 'Laporan pelaksanaan',
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
    comment: 'Data fasilitasi biasa',
  },
  status: {
    type: DataTypes.ENUM('perencanaan', 'pelaksanaan', 'selesai'),
    allowNull: false,
    defaultValue: 'perencanaan',
    comment: 'Status pelaksanaan',
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
  tableName: 'bkt_fsl',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default BktFsl;
