-- =====================================================
-- TABLE: bkt_mev
-- MODULE: BKT-MEV
-- Generated: 2026-02-17T19:24:46.470Z
-- =====================================================

CREATE TABLE IF NOT EXISTS bkt_mev (
  id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
  unit_kerja VARCHAR(100) CHECK(unit_kerja IN ('Sekretariat', 'UPTD', 'Bidang Ketersediaan', 'Bidang Distribusi', 'Bidang Konsumsi')) NOT NULL,
  reported_to_sekretariat BOOLEAN NOT NULL DEFAULT 0,
  reported_at TIMESTAMP,
  sekretariat_notes TEXT,
  layanan_id VARCHAR(10) NOT NULL,
  jenis_monev VARCHAR(100) CHECK(jenis_monev IN ('Monev Pelaporan', 'Monev Penanganan Kerawanan', 'Laporan Kinerja', 'Laporan Teknis', 'Data SAKIP')) NOT NULL,
  periode DATE NOT NULL,
  tahun INTEGER NOT NULL,
  bulan INTEGER,
  triwulan INTEGER,
  semester INTEGER,
  judul_laporan VARCHAR(255) NOT NULL,
  objek_monev VARCHAR(255),
  lokasi_monev VARCHAR(255),
  tanggal_monev DATE,
  metode_monev VARCHAR(100) CHECK(metode_monev IN ('Desk Evaluation', 'Field Visit', 'Survey', 'Interview', 'FGD', 'Lainnya')),
  tim_monev TEXT,
  program_yang_dimonev TEXT,
  target_kinerja TEXT,
  realisasi_kinerja TEXT,
  persentase_capaian DECIMAL(5,2),
  indikator_kinerja TEXT,
  temuan_monev TEXT,
  analisis_capaian TEXT,
  permasalahan TEXT,
  kendala TEXT,
  solusi TEXT,
  best_practice TEXT,
  lesson_learned TEXT,
  rekomendasi TEXT,
  tindak_lanjut TEXT,
  data_sakip_ikk TEXT,
  data_sakip_capaian DECIMAL(5,2),
  data_sakip_target DECIMAL(5,2),
  anggaran_program DECIMAL(15,2),
  realisasi_anggaran DECIMAL(15,2),
  persentase_serapan DECIMAL(5,2),
  output_program TEXT,
  outcome_program TEXT,
  dampak_program TEXT,
  file_laporan VARCHAR(255),
  file_data_pendukung JSON,
  file_foto_monev JSON,
  ditujukan_kepada VARCHAR(255),
  rincian_layanan TEXT,
  penanggung_jawab VARCHAR(255) NOT NULL DEFAULT 'Kepala Bidang Ketersediaan',
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

CREATE INDEX IF NOT EXISTS idx_bkt_mev_unit_kerja ON bkt_mev(unit_kerja);
CREATE INDEX IF NOT EXISTS idx_bkt_mev_layanan_id ON bkt_mev(layanan_id);
CREATE INDEX IF NOT EXISTS idx_bkt_mev_status ON bkt_mev(status);
CREATE INDEX IF NOT EXISTS idx_bkt_mev_created_at ON bkt_mev(created_at);

