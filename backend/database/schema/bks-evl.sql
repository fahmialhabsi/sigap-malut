-- =====================================================
-- TABLE: bks_evl
-- MODULE: BKS-EVL
-- Generated: 2026-02-17T19:24:46.504Z
-- =====================================================

CREATE TABLE IF NOT EXISTS bks_evl (
  id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
  unit_kerja VARCHAR(100) CHECK(unit_kerja IN ('Sekretariat', 'UPTD', 'Bidang Ketersediaan', 'Bidang Distribusi', 'Bidang Konsumsi')) NOT NULL,
  reported_to_sekretariat BOOLEAN NOT NULL DEFAULT 0,
  reported_at TIMESTAMP,
  sekretariat_notes TEXT,
  layanan_id VARCHAR(10) NOT NULL,
  jenis_evaluasi VARCHAR(100) CHECK(jenis_evaluasi IN ('Evaluasi Program Konsumsi', 'Evaluasi Penganekaragaman', 'Evaluasi Keamanan Pangan')) NOT NULL,
  periode DATE NOT NULL,
  tahun INTEGER NOT NULL,
  bulan INTEGER,
  triwulan INTEGER,
  semester INTEGER,
  judul_evaluasi VARCHAR(255) NOT NULL,
  objek_evaluasi VARCHAR(255),
  tujuan_evaluasi TEXT,
  metode_evaluasi VARCHAR(100) CHECK(metode_evaluasi IN ('Desk Evaluation', 'Field Visit', 'Survey', 'Interview', 'FGD', 'Kombinasi')),
  tim_evaluasi TEXT,
  tanggal_evaluasi DATE,
  lokasi_evaluasi VARCHAR(255),
  program_dievaluasi TEXT,
  target_program TEXT,
  realisasi_program TEXT,
  persentase_capaian DECIMAL(5,2),
  indikator_kinerja TEXT,
  skor_pph_capaian DECIMAL(5,2),
  skor_pph_target DECIMAL(5,2) DEFAULT 90,
  konsumsi_energi_per_kapita DECIMAL(10,2),
  konsumsi_protein_per_kapita DECIMAL(10,2),
  jumlah_kelompok_dibina INTEGER,
  jumlah_psat_fasilitasi INTEGER,
  jumlah_psat_tersertifikasi INTEGER,
  kasus_keracunan_pangan INTEGER DEFAULT 0,
  penanganan_keracunan TEXT,
  temuan_evaluasi TEXT,
  analisis_capaian TEXT,
  permasalahan TEXT,
  kendala TEXT,
  solusi TEXT,
  best_practice TEXT,
  lesson_learned TEXT,
  rekomendasi TEXT,
  tindak_lanjut TEXT,
  anggaran_program DECIMAL(15,2),
  realisasi_anggaran DECIMAL(15,2),
  persentase_serapan DECIMAL(5,2),
  output_program TEXT,
  outcome_program TEXT,
  dampak_program TEXT,
  file_laporan VARCHAR(255),
  file_data_pendukung JSON,
  file_foto JSON,
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

CREATE INDEX IF NOT EXISTS idx_bks_evl_unit_kerja ON bks_evl(unit_kerja);
CREATE INDEX IF NOT EXISTS idx_bks_evl_layanan_id ON bks_evl(layanan_id);
CREATE INDEX IF NOT EXISTS idx_bks_evl_status ON bks_evl(status);
CREATE INDEX IF NOT EXISTS idx_bks_evl_created_at ON bks_evl(created_at);

