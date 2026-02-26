// =====================================================
// MODEL: BksDvr
// TABLE: bks_dvr
// MODULE: BKS-DVR
// Generated: 2026-02-17T19:24:47.453Z
// =====================================================

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const BksDvr = sequelize.define('BksDvr', {
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
    comment: 'FK ke layanan_menpanrb (LY112-LY116)',
  },
  jenis_kegiatan: {
    type: DataTypes.ENUM('Pengembangan Pangan Lokal', 'Pemanfaatan Pekarangan', 'Kampanye', 'Edukasi B2SA', 'Pendampingan Kelompok'),
    allowNull: false,
    comment: 'Jenis kegiatan penganekaragaman',
  },
  nama_kegiatan: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: 'Nama kegiatan/program',
  },
  tanggal_kegiatan: {
    type: DataTypes.DATEONLY,
    comment: 'Tanggal pelaksanaan',
  },
  lokasi_kegiatan: {
    type: DataTypes.STRING(255),
    comment: 'Lokasi kegiatan',
  },
  kabupaten: {
    type: DataTypes.STRING(100),
    comment: 'Kabupaten',
  },
  kecamatan: {
    type: DataTypes.STRING(100),
    comment: 'Kecamatan',
  },
  desa: {
    type: DataTypes.STRING(100),
    comment: 'Desa',
  },
  jenis_pangan_lokal: {
    type: DataTypes.TEXT,
    comment: 'Pangan lokal yang dikembangkan',
  },
  potensi_pangan_lokal: {
    type: DataTypes.TEXT,
    comment: 'Potensi yang ada di wilayah',
  },
  pengembangan_dilakukan: {
    type: DataTypes.TEXT,
    comment: 'Bentuk pengembangan',
  },
  hasil_pengembangan: {
    type: DataTypes.TEXT,
    comment: 'Hasil yang dicapai',
  },
  jumlah_kk_pekarangan: {
    type: DataTypes.INTEGER,
    comment: 'KK yang memanfaatkan pekarangan',
  },
  luas_pekarangan_total: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Total luas pekarangan',
  },
  jenis_tanaman: {
    type: DataTypes.TEXT,
    comment: 'Tanaman yang ditanam',
  },
  hasil_panen_pekarangan: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Hasil panen dari pekarangan',
  },
  nilai_ekonomi: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Nilai ekonomi hasil pekarangan',
  },
  jenis_kampanye: {
    type: DataTypes.ENUM('Media Massa', 'Media Sosial', 'Spanduk', 'Leaflet', 'Event', 'Lainnya'),
    comment: 'Jenis kampanye',
  },
  tema_kampanye: {
    type: DataTypes.STRING(255),
    comment: 'Tema kampanye',
  },
  pesan_kampanye: {
    type: DataTypes.TEXT,
    comment: 'Pesan yang disampaikan',
  },
  media_kampanye: {
    type: DataTypes.TEXT,
    comment: 'Media yang digunakan',
  },
  jangkauan_kampanye: {
    type: DataTypes.INTEGER,
    comment: 'Estimasi jangkauan orang',
  },
  materi_edukasi_b2sa: {
    type: DataTypes.TEXT,
    comment: 'Materi edukasi B2SA',
  },
  metode_edukasi: {
    type: DataTypes.ENUM('Penyuluhan', 'Pelatihan', 'Demo Masak', 'Lomba', 'Lainnya'),
    comment: 'Metode edukasi',
  },
  sasaran_edukasi: {
    type: DataTypes.STRING(255),
    comment: 'Ibu rumah tangga/pelajar/dll',
  },
  jumlah_peserta_edukasi: {
    type: DataTypes.INTEGER,
    comment: 'Total peserta edukasi',
  },
  nama_kelompok_pangan: {
    type: DataTypes.STRING(255),
    comment: 'Nama kelompok yang didampingi',
  },
  jenis_kelompok: {
    type: DataTypes.ENUM('Kelompok Tani', 'Kelompok Wanita', 'PKK', 'UMKM', 'Lainnya'),
    comment: 'Jenis kelompok',
  },
  jumlah_anggota_kelompok: {
    type: DataTypes.INTEGER,
    comment: 'Jumlah anggota kelompok',
  },
  kegiatan_kelompok: {
    type: DataTypes.TEXT,
    comment: 'Kegiatan yang dilakukan',
  },
  frekuensi_pendampingan: {
    type: DataTypes.INTEGER,
    comment: 'Berapa kali pendampingan',
  },
  materi_pendampingan: {
    type: DataTypes.TEXT,
    comment: 'Materi yang diberikan',
  },
  produk_kelompok: {
    type: DataTypes.TEXT,
    comment: 'Produk yang dihasilkan',
  },
  omzet_kelompok: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Omzet per bulan',
  },
  bantuan_diberikan: {
    type: DataTypes.TEXT,
    comment: 'Bantuan yang diberikan',
  },
  nilai_bantuan: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Nilai bantuan',
  },
  output_kegiatan: {
    type: DataTypes.TEXT,
    comment: 'Output yang dihasilkan',
  },
  outcome_kegiatan: {
    type: DataTypes.TEXT,
    comment: 'Outcome yang dicapai',
  },
  dampak: {
    type: DataTypes.TEXT,
    comment: 'Dampak yang dirasakan',
  },
  kendala: {
    type: DataTypes.TEXT,
    comment: 'Kendala yang dihadapi',
  },
  solusi: {
    type: DataTypes.TEXT,
    comment: 'Solusi atas kendala',
  },
  biaya_kegiatan: {
    type: DataTypes.DECIMAL(15,2),
    comment: 'Biaya pelaksanaan',
  },
  sumber_anggaran: {
    type: DataTypes.STRING(255),
    comment: 'APBD/APBN/Swadaya',
  },
  file_dokumentasi: {
    type: DataTypes.JSON,
    comment: 'Array foto kegiatan',
  },
  file_laporan: {
    type: DataTypes.STRING(255),
    comment: 'Laporan kegiatan PDF',
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
    defaultValue: 'Masyarakat',
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
    comment: 'Data penganekaragaman biasa',
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
  tableName: 'bks_dvr',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default BksDvr;
