-- =====================================================
-- TABLE: bks_lap
-- MODULE: BKS-LAP
-- Generated: 2026-02-17T19:24:46.510Z
-- =====================================================

CREATE TABLE IF NOT EXISTS bks_lap (
  id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
  unit_kerja VARCHAR(100) CHECK(unit_kerja IN ('Sekretariat', 'UPTD', 'Bidang Ketersediaan', 'Bidang Distribusi', 'Bidang Konsumsi')) NOT NULL,
  reported_to_sekretariat BOOLEAN NOT NULL DEFAULT 0,
  reported_at TIMESTAMP,
  sekretariat_notes TEXT,
  layanan_id VARCHAR(10) NOT NULL,
  jenis_laporan VARCHAR(100) CHECK(jenis_laporan IN ('Laporan Kinerja', 'Data SAKIP')) NOT NULL,
  periode DATE NOT NULL,
  tahun INTEGER NOT NULL,
  bulan INTEGER,
  triwulan INTEGER,
  semester INTEGER,
  judul_laporan VARCHAR(255) NOT NULL,
  ringkasan_eksekutif TEXT,
  capaian_konsumsi_pangan TEXT,
  capaian_penganekaragaman TEXT,
  capaian_keamanan_pangan TEXT,
  skor_pph DECIMAL(5,2),
  target_pph DECIMAL(5,2) DEFAULT 90,
  status_pph VARCHAR(100) CHECK(status_pph IN ('On Target', 'Di Bawah Target')),
  konsumsi_energi DECIMAL(10,2),
  konsumsi_protein DECIMAL(10,2),
  jumlah_kelompok_pangan_dibina INTEGER,
  jumlah_psat_difasilitasi INTEGER,
  jumlah_psat_tersertifikasi INTEGER,
  kegiatan_edukasi_dilakukan INTEGER,
  peserta_edukasi_total INTEGER,
  kasus_keracunan_pangan INTEGER DEFAULT 0,
  data_sakip_ikk TEXT,
  data_sakip_capaian DECIMAL(5,2),
  data_sakip_target DECIMAL(5,2),
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
  penanggung_jawab VARCHAR(255) NOT NULL DEFAULT 'Kepala Bidang Konsumsi',
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

CREATE INDEX IF NOT EXISTS idx_bks_lap_unit_kerja ON bks_lap(unit_kerja);
CREATE INDEX IF NOT EXISTS idx_bks_lap_layanan_id ON bks_lap(layanan_id);
CREATE INDEX IF NOT EXISTS idx_bks_lap_status ON bks_lap(status);
CREATE INDEX IF NOT EXISTS idx_bks_lap_created_at ON bks_lap(created_at);

