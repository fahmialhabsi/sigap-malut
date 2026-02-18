-- =====================================================
-- TABLE: sek_hum
-- MODULE: SEK-HUM
-- Generated: 2026-02-17T19:24:46.415Z
-- =====================================================

CREATE TABLE IF NOT EXISTS sek_hum (
  id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
  layanan_id VARCHAR(10) NOT NULL,
  jenis_layanan_humas VARCHAR(100) CHECK(jenis_layanan_humas IN ('Protokol', 'Acara Resmi', 'Penerimaan Tamu', 'Publikasi', 'Dokumentasi')) NOT NULL,
  nama_kegiatan VARCHAR(255),
  jenis_acara VARCHAR(100) CHECK(jenis_acara IN ('Rapat', 'Upacara', 'Kunjungan', 'Sosialisasi', 'Workshop', 'Launching', 'Lainnya')),
  tanggal_acara DATE,
  waktu_mulai TIME,
  waktu_selesai TIME,
  tempat VARCHAR(255),
  pimpinan_hadir VARCHAR(255),
  tamu_vip TEXT,
  jumlah_peserta INTEGER,
  rundown_acara TEXT,
  mc VARCHAR(255),
  protokoler VARCHAR(255),
  nama_tamu VARCHAR(255),
  instansi_tamu VARCHAR(255),
  keperluan_kunjungan TEXT,
  penerima_tamu VARCHAR(255),
  judul_publikasi VARCHAR(255),
  jenis_publikasi VARCHAR(100) CHECK(jenis_publikasi IN ('Berita', 'Press Release', 'Artikel', 'Video', 'Foto', 'Infografis')),
  media_publikasi VARCHAR(100) CHECK(media_publikasi IN ('Website', 'Media Sosial', 'Media Massa', 'Buletin', 'Lainnya')),
  link_publikasi VARCHAR(255),
  isi_publikasi TEXT,
  fotografer VARCHAR(255),
  videografer VARCHAR(255),
  jumlah_foto INTEGER,
  jumlah_video INTEGER,
  file_foto JSON,
  file_video JSON,
  file_rundown VARCHAR(255),
  file_undangan VARCHAR(255),
  penanggung_jawab VARCHAR(255) NOT NULL DEFAULT 'Kasubbag Umum',
  pelaksana VARCHAR(255) NOT NULL,
  is_sensitive VARCHAR(100) CHECK(is_sensitive IN ('Biasa', 'Sensitif')) NOT NULL DEFAULT 'Biasa',
  status VARCHAR(100) CHECK(status IN ('pending', 'persiapan', 'berlangsung', 'selesai')) NOT NULL DEFAULT 'pending',
  keterangan TEXT,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sek_hum_layanan_id ON sek_hum(layanan_id);
CREATE INDEX IF NOT EXISTS idx_sek_hum_status ON sek_hum(status);
CREATE INDEX IF NOT EXISTS idx_sek_hum_created_at ON sek_hum(created_at);

