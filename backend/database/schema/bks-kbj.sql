-- =====================================================
-- TABLE: bks_kbj
-- MODULE: BKS-KBJ
-- Generated: 2026-02-17T19:24:46.506Z
-- =====================================================

CREATE TABLE IF NOT EXISTS bks_kbj (
  id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
  unit_kerja VARCHAR(100) CHECK(unit_kerja IN ('Sekretariat', 'UPTD', 'Bidang Ketersediaan', 'Bidang Distribusi', 'Bidang Konsumsi')) NOT NULL,
  reported_to_sekretariat BOOLEAN NOT NULL DEFAULT 0,
  reported_at TIMESTAMP,
  sekretariat_notes TEXT,
  layanan_id VARCHAR(10) NOT NULL,
  jenis_kebijakan VARCHAR(100) CHECK(jenis_kebijakan IN ('Kebijakan Konsumsi', 'Pedoman B2SA', 'Penganekaragaman Pangan', 'Sinkronisasi', 'Rekomendasi Intervensi')) NOT NULL,
  nomor_dokumen VARCHAR(100),
  tanggal_dokumen DATE NOT NULL,
  periode VARCHAR(50),
  tahun INTEGER NOT NULL,
  judul_kebijakan VARCHAR(255) NOT NULL,
  latar_belakang TEXT,
  ruang_lingkup TEXT,
  tujuan TEXT,
  sasaran TEXT,
  prinsip_b2sa TEXT,
  pedoman_b2sa TEXT,
  skor_pph_target DECIMAL(5,2) DEFAULT 90,
  strategi_penganekaragaman TEXT,
  pangan_lokal_prioritas TEXT,
  target_konsumsi_lokal TEXT,
  intervensi_konsumsi TEXT,
  kelompok_sasaran TEXT,
  wilayah_prioritas TEXT,
  koordinasi_dengan TEXT,
  hasil_sinkronisasi TEXT,
  rekomendasi TEXT,
  indikator_keberhasilan TEXT,
  target_capaian TEXT,
  dasar_hukum TEXT,
  tindak_lanjut TEXT,
  file_dokumen VARCHAR(255),
  file_lampiran JSON,
  rincian_layanan TEXT,
  penanggung_jawab VARCHAR(255) NOT NULL DEFAULT 'Kepala Bidang Konsumsi',
  pelaksana VARCHAR(255) NOT NULL,
  kelompok_penerima VARCHAR(255),
  jenis_data VARCHAR(255),
  is_sensitive VARCHAR(100) CHECK(is_sensitive IN ('Biasa', 'Sensitif')) NOT NULL DEFAULT 'Sensitif',
  status VARCHAR(100) CHECK(status IN ('draft', 'review', 'finalisasi', 'disetujui', 'final')) NOT NULL DEFAULT 'draft',
  keterangan TEXT,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_bks_kbj_unit_kerja ON bks_kbj(unit_kerja);
CREATE INDEX IF NOT EXISTS idx_bks_kbj_layanan_id ON bks_kbj(layanan_id);
CREATE INDEX IF NOT EXISTS idx_bks_kbj_status ON bks_kbj(status);
CREATE INDEX IF NOT EXISTS idx_bks_kbj_created_at ON bks_kbj(created_at);

