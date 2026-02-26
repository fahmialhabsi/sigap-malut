-- =====================================================
-- TABLE: bks_dvr
-- MODULE: BKS-DVR
-- Generated: 2026-02-17T19:24:46.500Z
-- =====================================================

CREATE TABLE IF NOT EXISTS bks_dvr (
  id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
  unit_kerja VARCHAR(100) CHECK(unit_kerja IN ('Sekretariat', 'UPTD', 'Bidang Ketersediaan', 'Bidang Distribusi', 'Bidang Konsumsi')) NOT NULL,
  reported_to_sekretariat BOOLEAN NOT NULL DEFAULT 0,
  reported_at TIMESTAMP,
  sekretariat_notes TEXT,
  layanan_id VARCHAR(10) NOT NULL,
  jenis_kegiatan VARCHAR(100) CHECK(jenis_kegiatan IN ('Pengembangan Pangan Lokal', 'Pemanfaatan Pekarangan', 'Kampanye', 'Edukasi B2SA', 'Pendampingan Kelompok')) NOT NULL,
  nama_kegiatan VARCHAR(255) NOT NULL,
  tanggal_kegiatan DATE,
  lokasi_kegiatan VARCHAR(255),
  kabupaten VARCHAR(100),
  kecamatan VARCHAR(100),
  desa VARCHAR(100),
  jenis_pangan_lokal TEXT,
  potensi_pangan_lokal TEXT,
  pengembangan_dilakukan TEXT,
  hasil_pengembangan TEXT,
  jumlah_kk_pekarangan INTEGER,
  luas_pekarangan_total DECIMAL(15,2),
  jenis_tanaman TEXT,
  hasil_panen_pekarangan DECIMAL(15,2),
  nilai_ekonomi DECIMAL(15,2),
  jenis_kampanye VARCHAR(100) CHECK(jenis_kampanye IN ('Media Massa', 'Media Sosial', 'Spanduk', 'Leaflet', 'Event', 'Lainnya')),
  tema_kampanye VARCHAR(255),
  pesan_kampanye TEXT,
  media_kampanye TEXT,
  jangkauan_kampanye INTEGER,
  materi_edukasi_b2sa TEXT,
  metode_edukasi VARCHAR(100) CHECK(metode_edukasi IN ('Penyuluhan', 'Pelatihan', 'Demo Masak', 'Lomba', 'Lainnya')),
  sasaran_edukasi VARCHAR(255),
  jumlah_peserta_edukasi INTEGER,
  nama_kelompok_pangan VARCHAR(255),
  jenis_kelompok VARCHAR(100) CHECK(jenis_kelompok IN ('Kelompok Tani', 'Kelompok Wanita', 'PKK', 'UMKM', 'Lainnya')),
  jumlah_anggota_kelompok INTEGER,
  kegiatan_kelompok TEXT,
  frekuensi_pendampingan INTEGER,
  materi_pendampingan TEXT,
  produk_kelompok TEXT,
  omzet_kelompok DECIMAL(15,2),
  bantuan_diberikan TEXT,
  nilai_bantuan DECIMAL(15,2),
  output_kegiatan TEXT,
  outcome_kegiatan TEXT,
  dampak TEXT,
  kendala TEXT,
  solusi TEXT,
  biaya_kegiatan DECIMAL(15,2),
  sumber_anggaran VARCHAR(255),
  file_dokumentasi JSON,
  file_laporan VARCHAR(255),
  rincian_layanan TEXT,
  penanggung_jawab VARCHAR(255) NOT NULL DEFAULT 'Kepala Bidang Konsumsi',
  pelaksana VARCHAR(255) NOT NULL,
  kelompok_penerima VARCHAR(255) DEFAULT 'Masyarakat',
  jenis_data VARCHAR(255),
  is_sensitive VARCHAR(100) CHECK(is_sensitive IN ('Biasa', 'Sensitif')) NOT NULL DEFAULT 'Biasa',
  status VARCHAR(100) CHECK(status IN ('perencanaan', 'pelaksanaan', 'selesai')) NOT NULL DEFAULT 'perencanaan',
  keterangan TEXT,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bks_dvr_unit_kerja ON bks_dvr(unit_kerja);
CREATE INDEX IF NOT EXISTS idx_bks_dvr_layanan_id ON bks_dvr(layanan_id);
CREATE INDEX IF NOT EXISTS idx_bks_dvr_status ON bks_dvr(status);
CREATE INDEX IF NOT EXISTS idx_bks_dvr_created_at ON bks_dvr(created_at);

