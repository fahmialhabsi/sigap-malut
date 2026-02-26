-- =====================================================
-- TABLE: bkt_krw
-- MODULE: BKT-KRW
-- Generated: 2026-02-17T19:24:46.467Z
-- =====================================================

CREATE TABLE IF NOT EXISTS bkt_krw (
  id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
  unit_kerja VARCHAR(100) CHECK(unit_kerja IN ('Sekretariat', 'UPTD', 'Bidang Ketersediaan', 'Bidang Distribusi', 'Bidang Konsumsi')) NOT NULL,
  reported_to_sekretariat BOOLEAN NOT NULL DEFAULT 0,
  reported_at TIMESTAMP,
  sekretariat_notes TEXT,
  layanan_id VARCHAR(10) NOT NULL,
  jenis_kerawanan VARCHAR(100) CHECK(jenis_kerawanan IN ('Identifikasi', 'Peta Kerawanan', 'Rencana Aksi', 'Koordinasi Lintas Sektor')) NOT NULL,
  periode DATE NOT NULL,
  tahun INTEGER NOT NULL,
  kabupaten VARCHAR(100) NOT NULL,
  kecamatan VARCHAR(100),
  desa VARCHAR(100),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  tingkat_kerawanan VARCHAR(100) CHECK(tingkat_kerawanan IN ('Prioritas 1', 'Prioritas 2', 'Prioritas 3', 'Prioritas 4', 'Prioritas 5', 'Prioritas 6')) NOT NULL,
  skor_kerawanan DECIMAL(5,2),
  indikator_ketersediaan_pangan DECIMAL(5,2),
  indikator_akses_pangan DECIMAL(5,2),
  indikator_pemanfaatan_pangan DECIMAL(5,2),
  indikator_kerawanan_kesehatan DECIMAL(5,2),
  jumlah_penduduk INTEGER,
  jumlah_kk INTEGER,
  jumlah_kk_miskin INTEGER,
  persentase_kemiskinan DECIMAL(5,2),
  stunting_prevalensi DECIMAL(5,2),
  wasting_prevalensi DECIMAL(5,2),
  underweight_prevalensi DECIMAL(5,2),
  jenis_pangan_rawan TEXT,
  stok_pangan DECIMAL(15,2),
  satuan_stok VARCHAR(20) DEFAULT 'kg',
  tanggal_update_stok DATE,
  status_ketersediaan VARCHAR(100) CHECK(status_ketersediaan IN ('Aman', 'Waspada', 'Rawan', 'Sangat Rawan')),
  penyebab_kerawanan TEXT,
  dampak_kerawanan TEXT,
  rencana_aksi TEXT,
  target_intervensi TEXT,
  waktu_pelaksanaan VARCHAR(100),
  anggaran_kebutuhan DECIMAL(15,2),
  sumber_anggaran VARCHAR(255),
  instansi_terkait TEXT,
  koordinasi_dengan TEXT,
  hasil_koordinasi TEXT,
  tindak_lanjut_koordinasi TEXT,
  file_peta VARCHAR(255),
  file_data_gis VARCHAR(255),
  file_laporan VARCHAR(255),
  file_rencana_aksi VARCHAR(255),
  rincian_layanan TEXT,
  penanggung_jawab VARCHAR(255) NOT NULL DEFAULT 'Kepala Bidang Ketersediaan',
  pelaksana VARCHAR(255) NOT NULL,
  kelompok_penerima VARCHAR(255) DEFAULT 'Pemerintah Daerah/Masyarakat',
  jenis_data VARCHAR(255),
  is_sensitive VARCHAR(100) CHECK(is_sensitive IN ('Biasa', 'Sensitif')) NOT NULL DEFAULT 'Sensitif',
  status VARCHAR(100) CHECK(status IN ('draft', 'review', 'final', 'publish')) NOT NULL DEFAULT 'draft',
  keterangan TEXT,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bkt_krw_unit_kerja ON bkt_krw(unit_kerja);
CREATE INDEX IF NOT EXISTS idx_bkt_krw_layanan_id ON bkt_krw(layanan_id);
CREATE INDEX IF NOT EXISTS idx_bkt_krw_status ON bkt_krw(status);
CREATE INDEX IF NOT EXISTS idx_bkt_krw_created_at ON bkt_krw(created_at);

