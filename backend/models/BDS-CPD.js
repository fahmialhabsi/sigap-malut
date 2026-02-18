// =====================================================
// MODEL: BdsCpd
// TABLE: bds_cpd
// MODULE: BDS-CPD
// Generated: 2026-02-17T19:24:47.437Z
// =====================================================

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const BdsCpd = sequelize.define('BdsCpd', {
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
    comment: 'FK ke layanan_menpanrb (LY092-LY096)',
  },
  jenis_layanan_cppd: {
    type: DataTypes.ENUM('Perencanaan', 'Pengadaan', 'Pengelolaan Stok', 'Penyaluran Darurat', 'Evaluasi'),
    allowNull: false,
    comment: 'Jenis layanan CPPD',
  },
  periode: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: 'Periode perencanaan/pelaksanaan',
  },
  tahun: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: 'Tahun',
  },
  bulan: {
    type: DataTypes.INTEGER,
    comment: 'Bulan (jika bulanan)',
  },
  komoditas_id: {
    type: DataTypes.INTEGER,
    comment: 'FK ke tabel komoditas',
  },
  nama_komoditas: {
    type: DataTypes.STRING(255),
    comment: 'Denormalized (biasanya beras)',
  },
  kebutuhan_cppd: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Kebutuhan CPPD yang direncanakan',
  },
  dasar_perhitungan: {
    type: DataTypes.TEXT,
    comment: 'Dasar perhitungan kebutuhan',
  },
  target_stok: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Target stok yang harus ada',
  },
  lokasi_penyimpanan: {
    type: DataTypes.STRING(255),
    comment: 'Gudang penyimpanan CPPD',
  },
  kapasitas_gudang: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Kapasitas maksimal gudang',
  },
  rencana_pengadaan: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Volume yang akan diadakan',
  },
  sumber_pengadaan: {
    type: DataTypes.ENUM('APBD', 'APBN', 'Swadaya', 'Lainnya'),
    comment: 'Sumber dana pengadaan',
  },
  metode_pengadaan: {
    type: DataTypes.ENUM('Pembelian Langsung', 'Tender', 'Penunjukan Langsung', 'Hibah'),
    comment: 'Metode pengadaan',
  },
  penyedia: {
    type: DataTypes.STRING(255),
    comment: 'Nama penyedia/supplier',
  },
  tanggal_pengadaan: {
    type: DataTypes.DATEONLY,
    comment: 'Kapan pengadaan dilakukan',
  },
  volume_pengadaan: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Realisasi volume pengadaan',
  },
  harga_satuan: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Harga per kg/ton',
  },
  total_nilai: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Total biaya pengadaan',
  },
  kualitas_cppd: {
    type: DataTypes.ENUM('Sangat Baik', 'Baik', 'Cukup', 'Kurang'),
    defaultValue: 'Baik',
    comment: 'Kualitas beras CPPD',
  },
  tanggal_masuk_gudang: {
    type: DataTypes.DATEONLY,
    comment: 'Kapan masuk gudang',
  },
  stok_awal_bulan: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Stok awal bulan',
  },
  penerimaan_bulan_ini: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Penerimaan bulan ini',
  },
  penyaluran_bulan_ini: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Penyaluran bulan ini',
  },
  stok_akhir_bulan: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Stok akhir bulan',
  },
  status_stok: {
    type: DataTypes.ENUM('Aman', 'Menipis', 'Kritis'),
    defaultValue: 'Aman',
    comment: 'Status stok CPPD',
  },
  persentase_terhadap_target: {
    type: DataTypes.DECIMAL(5,2),
    comment: 'Stok dibanding target',
  },
  kondisi_fisik_cppd: {
    type: DataTypes.ENUM('Baik', 'Rusak Ringan', 'Rusak Berat'),
    defaultValue: 'Baik',
    comment: 'Kondisi fisik beras',
  },
  suhu_gudang: {
    type: DataTypes.DECIMAL(5,2),
    comment: 'Suhu penyimpanan',
  },
  kelembaban_gudang: {
    type: DataTypes.DECIMAL(5,2),
    comment: 'Kelembaban gudang',
  },
  petugas_gudang: {
    type: DataTypes.STRING(255),
    comment: 'Nama petugas',
  },
  jenis_penyaluran: {
    type: DataTypes.ENUM('Darurat Bencana', 'Kerawanan Pangan', 'Stabilisasi Harga', 'Lainnya'),
    comment: 'Jenis penyaluran',
  },
  alasan_penyaluran: {
    type: DataTypes.TEXT,
    comment: 'Mengapa CPPD disalurkan',
  },
  wilayah_penyaluran: {
    type: DataTypes.STRING(255),
    comment: 'Ke wilayah mana',
  },
  penerima_penyaluran: {
    type: DataTypes.STRING(255),
    comment: 'Siapa yang menerima',
  },
  volume_penyaluran: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Jumlah yang disalurkan',
  },
  tanggal_penyaluran: {
    type: DataTypes.DATEONLY,
    comment: 'Kapan disalurkan',
  },
  status_penyaluran: {
    type: DataTypes.ENUM('Perencanaan', 'Proses', 'Selesai'),
    comment: 'Status penyaluran',
  },
  jumlah_penerima_manfaat: {
    type: DataTypes.INTEGER,
    comment: 'Jumlah KK/orang',
  },
  dampak_penyaluran: {
    type: DataTypes.TEXT,
    comment: 'Dampak yang dirasakan',
  },
  evaluasi_pelaksanaan: {
    type: DataTypes.TEXT,
    comment: 'Evaluasi pelaksanaan CPPD',
  },
  kendala: {
    type: DataTypes.TEXT,
    comment: 'Kendala yang dihadapi',
  },
  solusi: {
    type: DataTypes.TEXT,
    comment: 'Solusi atas kendala',
  },
  rekomendasi: {
    type: DataTypes.TEXT,
    comment: 'Rekomendasi perbaikan',
  },
  file_rencana: {
    type: DataTypes.STRING(255),
    comment: 'Dokumen perencanaan CPPD',
  },
  file_kontrak: {
    type: DataTypes.STRING(255),
    comment: 'Kontrak pengadaan',
  },
  file_bast: {
    type: DataTypes.STRING(255),
    comment: 'Berita Acara Serah Terima',
  },
  file_laporan_stok: {
    type: DataTypes.STRING(255),
    comment: 'Laporan stok bulanan',
  },
  file_foto: {
    type: DataTypes.JSON,
    comment: 'Foto gudang/penyaluran',
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
    defaultValue: 'Sensitif',
    comment: 'Data CPPD sensitif (kecuali penyaluran darurat)',
  },
  status: {
    type: DataTypes.ENUM('draft', 'review', 'final', 'approved'),
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
  tableName: 'bds_cpd',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default BdsCpd;
