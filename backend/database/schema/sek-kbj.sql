-- =====================================================
-- TABLE: sek_kbj
-- MODULE: SEK-KBJ
-- Generated: 2026-02-17T19:24:46.422Z
-- =====================================================

CREATE TABLE IF NOT EXISTS sek_kbj (
  id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
  layanan_id VARCHAR(10) NOT NULL,
  jenis_layanan_kebijakan VARCHAR(100) CHECK(jenis_layanan_kebijakan IN ('Bahan Kebijakan Teknis', 'Rekapitulasi Laporan')) NOT NULL,
  judul VARCHAR(255) NOT NULL,
  periode VARCHAR(50) NOT NULL,
  tahun INTEGER NOT NULL,
  ruang_lingkup TEXT,
  latar_belakang TEXT,
  permasalahan TEXT,
  analisis TEXT,
  opsi_kebijakan TEXT,
  rekomendasi_kebijakan TEXT,
  dampak TEXT,
  dasar_hukum TEXT,
  sumber_data_bidang_ketersediaan TEXT,
  sumber_data_bidang_distribusi TEXT,
  sumber_data_bidang_konsumsi TEXT,
  sumber_data_uptd TEXT,
  rekapitulasi_keuangan TEXT,
  rekapitulasi_program TEXT,
  rekapitulasi_capaian TEXT,
  kesimpulan TEXT,
  tindak_lanjut TEXT,
  file_dokumen VARCHAR(255),
  file_lampiran JSON,
  ditujukan_kepada VARCHAR(255),
  penanggung_jawab VARCHAR(255) NOT NULL DEFAULT 'Sekretaris',
  pelaksana VARCHAR(255) NOT NULL,
  is_sensitive VARCHAR(100) CHECK(is_sensitive IN ('Biasa', 'Sensitif')) NOT NULL DEFAULT 'Sensitif',
  status VARCHAR(100) CHECK(status IN ('draft', 'review', 'finalisasi', 'disetujui')) NOT NULL DEFAULT 'draft',
  keterangan TEXT,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sek_kbj_layanan_id ON sek_kbj(layanan_id);
CREATE INDEX IF NOT EXISTS idx_sek_kbj_status ON sek_kbj(status);
CREATE INDEX IF NOT EXISTS idx_sek_kbj_created_at ON sek_kbj(created_at);

