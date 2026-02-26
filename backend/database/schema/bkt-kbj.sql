-- =====================================================
-- TABLE: bkt_kbj
-- MODULE: BKT-KBJ
-- Generated: 2026-02-17T19:24:46.463Z
-- =====================================================

CREATE TABLE IF NOT EXISTS bkt_kbj (
  id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
  unit_kerja VARCHAR(100) CHECK(unit_kerja IN ('Sekretariat', 'UPTD', 'Bidang Ketersediaan', 'Bidang Distribusi', 'Bidang Konsumsi')) NOT NULL,
  reported_to_sekretariat BOOLEAN NOT NULL DEFAULT 0,
  reported_at TIMESTAMP,
  sekretariat_notes TEXT,
  layanan_id VARCHAR(10) NOT NULL,
  jenis_kebijakan VARCHAR(100) CHECK(jenis_kebijakan IN ('Analisis Ketersediaan', 'Rekomendasi', 'Penetapan Komoditas Strategis', 'Pedoman Teknis', 'Sinkronisasi Pusat-Daerah')) NOT NULL,
  nomor_dokumen VARCHAR(100),
  tanggal_dokumen DATE NOT NULL,
  periode_analisis VARCHAR(50),
  tahun INTEGER NOT NULL,
  judul_kebijakan VARCHAR(255) NOT NULL,
  latar_belakang TEXT,
  ruang_lingkup TEXT,
  data_ketersediaan TEXT,
  data_produksi TEXT,
  data_pasokan TEXT,
  analisis_situasi TEXT,
  permasalahan TEXT,
  opsi_solusi TEXT,
  rekomendasi TEXT NOT NULL,
  komoditas_strategis JSON,
  target_pencapaian TEXT,
  indikator_keberhasilan TEXT,
  dasar_hukum TEXT,
  instansi_terkait TEXT,
  koordinasi_dengan TEXT,
  hasil_sinkronisasi TEXT,
  tindak_lanjut TEXT,
  file_dokumen VARCHAR(255),
  file_lampiran JSON,
  rincian_layanan TEXT,
  penanggung_jawab VARCHAR(255) NOT NULL DEFAULT 'Kepala Bidang Ketersediaan',
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

CREATE INDEX IF NOT EXISTS idx_bkt_kbj_unit_kerja ON bkt_kbj(unit_kerja);
CREATE INDEX IF NOT EXISTS idx_bkt_kbj_layanan_id ON bkt_kbj(layanan_id);
CREATE INDEX IF NOT EXISTS idx_bkt_kbj_status ON bkt_kbj(status);
CREATE INDEX IF NOT EXISTS idx_bkt_kbj_created_at ON bkt_kbj(created_at);

