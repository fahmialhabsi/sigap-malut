-- =====================================================
-- TABLE: bds_lap
-- MODULE: BDS-LAP
-- Generated: 2026-02-17T19:24:46.489Z
-- =====================================================

CREATE TABLE IF NOT EXISTS bds_lap (
  id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
  unit_kerja VARCHAR(100) CHECK(unit_kerja IN ('Sekretariat', 'UPTD', 'Bidang Ketersediaan', 'Bidang Distribusi', 'Bidang Konsumsi')) NOT NULL,
  reported_to_sekretariat BOOLEAN NOT NULL DEFAULT 0,
  reported_at TIMESTAMP,
  sekretariat_notes TEXT,
  layanan_id VARCHAR(10) NOT NULL DEFAULT 'LY106',
  periode DATE NOT NULL,
  tahun INTEGER NOT NULL,
  bulan INTEGER,
  triwulan INTEGER,
  semester INTEGER,
  judul_laporan VARCHAR(255) NOT NULL,
  ringkasan_eksekutif TEXT,
  capaian_distribusi TEXT,
  capaian_stabilisasi_harga TEXT,
  capaian_cppd TEXT,
  inflasi_pangan DECIMAL(5,2),
  target_inflasi DECIMAL(5,2) DEFAULT 2.50,
  status_inflasi VARCHAR(100) CHECK(status_inflasi IN ('On Target', 'Warning', 'Alert')),
  volume_distribusi_total DECIMAL(15,2),
  stok_cppd DECIMAL(15,2),
  operasi_pasar_dilakukan INTEGER,
  rapat_tpid_dilakukan INTEGER,
  anggaran_program DECIMAL(15,2),
  realisasi_anggaran DECIMAL(15,2),
  persentase_serapan DECIMAL(5,2),
  permasalahan TEXT,
  solusi TEXT,
  rekomendasi TEXT,
  tindak_lanjut TEXT,
  file_laporan VARCHAR(255),
  file_data_pendukung JSON,
  ditujukan_kepada VARCHAR(255) DEFAULT 'Sekretariat',
  rincian_layanan TEXT,
  penanggung_jawab VARCHAR(255) NOT NULL DEFAULT 'Kepala Bidang Distribusi',
  pelaksana VARCHAR(255) NOT NULL,
  kelompok_penerima VARCHAR(255) DEFAULT 'Sekretariat/Pimpinan',
  jenis_data VARCHAR(255),
  is_sensitive VARCHAR(100) CHECK(is_sensitive IN ('Biasa', 'Sensitif')) NOT NULL DEFAULT 'Sensitif',
  status VARCHAR(100) CHECK(status IN ('draft', 'review', 'final')) NOT NULL DEFAULT 'draft',
  keterangan TEXT,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bds_lap_unit_kerja ON bds_lap(unit_kerja);
CREATE INDEX IF NOT EXISTS idx_bds_lap_layanan_id ON bds_lap(layanan_id);
CREATE INDEX IF NOT EXISTS idx_bds_lap_status ON bds_lap(status);
CREATE INDEX IF NOT EXISTS idx_bds_lap_created_at ON bds_lap(created_at);

