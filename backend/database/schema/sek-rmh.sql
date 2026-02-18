-- =====================================================
-- TABLE: sek_rmh
-- MODULE: SEK-RMH
-- Generated: 2026-02-17T19:24:46.452Z
-- =====================================================

CREATE TABLE IF NOT EXISTS sek_rmh (
  id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
  layanan_id VARCHAR(10) NOT NULL,
  jenis_layanan_rumah_tangga VARCHAR(100) CHECK(jenis_layanan_rumah_tangga IN ('Perjalanan Dinas', 'Kebersihan', 'Keamanan', 'Fasilitas', 'Ruang Rapat', 'Kendaraan')) NOT NULL,
  nomor_sppd VARCHAR(100),
  nomor_st VARCHAR(100),
  nama_pegawai VARCHAR(255),
  nip_pegawai VARCHAR(18),
  tujuan VARCHAR(255),
  keperluan TEXT,
  tanggal_berangkat DATE,
  tanggal_kembali DATE,
  lama_hari INTEGER,
  biaya_transport DECIMAL(15,2),
  biaya_penginapan DECIMAL(15,2),
  uang_harian DECIMAL(15,2),
  total_biaya DECIMAL(15,2),
  area_kebersihan VARCHAR(255),
  jadwal_kebersihan VARCHAR(100) CHECK(jadwal_kebersihan IN ('Harian', 'Mingguan', 'Bulanan')),
  petugas_kebersihan VARCHAR(255),
  pos_keamanan VARCHAR(100),
  shift_keamanan VARCHAR(100) CHECK(shift_keamanan IN ('Pagi', 'Siang', 'Malam')),
  petugas_keamanan VARCHAR(255),
  jenis_fasilitas VARCHAR(255),
  kondisi_fasilitas VARCHAR(100) CHECK(kondisi_fasilitas IN ('Baik', 'Rusak', 'Perlu Perbaikan')) DEFAULT 'Baik',
  nama_ruang_rapat VARCHAR(255),
  kapasitas INTEGER,
  tanggal_pemesanan DATE,
  jam_mulai TIME,
  jam_selesai TIME,
  pemesan VARCHAR(255),
  nomor_polisi VARCHAR(20),
  jenis_kendaraan VARCHAR(100) CHECK(jenis_kendaraan IN ('Mobil Dinas', 'Motor Dinas', 'Mobil Operasional')),
  driver VARCHAR(255),
  tanggal_pakai DATE,
  km_awal INTEGER,
  km_akhir INTEGER,
  bbm_liter DECIMAL(10,2),
  file_sppd VARCHAR(255),
  file_laporan VARCHAR(255),
  penanggung_jawab VARCHAR(255) NOT NULL DEFAULT 'Kasubbag Umum',
  pelaksana VARCHAR(255) NOT NULL,
  is_sensitive VARCHAR(100) CHECK(is_sensitive IN ('Biasa', 'Sensitif')) NOT NULL DEFAULT 'Biasa',
  status VARCHAR(100) CHECK(status IN ('pending', 'disetujui', 'ditolak', 'selesai')) NOT NULL DEFAULT 'pending',
  keterangan TEXT,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sek_rmh_layanan_id ON sek_rmh(layanan_id);
CREATE INDEX IF NOT EXISTS idx_sek_rmh_status ON sek_rmh(status);
CREATE INDEX IF NOT EXISTS idx_sek_rmh_created_at ON sek_rmh(created_at);

