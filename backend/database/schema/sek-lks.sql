-- =====================================================
-- TABLE: sek_lks
-- MODULE: SEK-LKS
-- Generated: 2026-02-17T19:24:46.437Z
-- =====================================================

CREATE TABLE IF NOT EXISTS sek_lks (
  id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
  layanan_id VARCHAR(10) NOT NULL DEFAULT 'LY050',
  periode DATE NOT NULL,
  tahun INTEGER NOT NULL,
  bulan INTEGER NOT NULL,
  skor_pph DECIMAL(5,2),
  target_pph DECIMAL(5,2) DEFAULT 90,
  status_pph VARCHAR(100) CHECK(status_pph IN ('On Target', 'Di Bawah Target')),
  konsumsi_kalori_per_kapita DECIMAL(10,2),
  konsumsi_protein_per_kapita DECIMAL(10,2),
  total_penerima_sppg INTEGER,
  distribusi_sppg_realisasi DECIMAL(15,2),
  program_mbg_penerima INTEGER,
  program_diversifikasi INTEGER,
  inspeksi_keamanan_pangan INTEGER,
  pangan_aman INTEGER,
  pangan_tidak_aman INTEGER,
  kasus_keracunan INTEGER DEFAULT 0,
  korban_keracunan INTEGER DEFAULT 0,
  tindakan_terhadap_keracunan TEXT,
  edukasi_dilakukan INTEGER,
  peserta_edukasi INTEGER,
  analisis TEXT,
  rekomendasi TEXT,
  sumber_data VARCHAR(255) DEFAULT 'Bidang Konsumsi & Keamanan Pangan',
  file_laporan VARCHAR(255),
  file_data_pendukung JSON,
  penanggung_jawab VARCHAR(255) NOT NULL DEFAULT 'Sekretaris',
  pelaksana VARCHAR(255) NOT NULL DEFAULT 'Bidang Konsumsi',
  is_sensitive VARCHAR(100) CHECK(is_sensitive IN ('Biasa', 'Sensitif')) NOT NULL DEFAULT 'Biasa',
  status VARCHAR(100) CHECK(status IN ('draft', 'review', 'final')) NOT NULL DEFAULT 'draft',
  keterangan TEXT,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sek_lks_layanan_id ON sek_lks(layanan_id);
CREATE INDEX IF NOT EXISTS idx_sek_lks_status ON sek_lks(status);
CREATE INDEX IF NOT EXISTS idx_sek_lks_created_at ON sek_lks(created_at);

