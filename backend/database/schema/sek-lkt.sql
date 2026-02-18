-- =====================================================
-- TABLE: sek_lkt
-- MODULE: SEK-LKT
-- Generated: 2026-02-17T19:24:46.439Z
-- =====================================================

CREATE TABLE IF NOT EXISTS sek_lkt (
  id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
  layanan_id VARCHAR(10) NOT NULL DEFAULT 'LY048',
  periode DATE NOT NULL,
  tahun INTEGER NOT NULL,
  bulan INTEGER NOT NULL,
  total_komoditas INTEGER,
  total_stok DECIMAL(15,2),
  stok_aman INTEGER,
  stok_menipis INTEGER,
  stok_kritis INTEGER,
  wilayah_rawan_pangan INTEGER,
  tingkat_kerawanan VARCHAR(100) CHECK(tingkat_kerawanan IN ('Aman', 'Waspada', 'Rawan', 'Sangat Rawan')) NOT NULL DEFAULT 'Aman',
  komoditas_kritis TEXT,
  produksi_pangan_total DECIMAL(15,2),
  konsumsi_estimasi DECIMAL(15,2),
  surplus_defisit DECIMAL(15,2),
  analisis TEXT,
  rekomendasi TEXT,
  sumber_data VARCHAR(255) DEFAULT 'Bidang Ketersediaan & Kerawanan Pangan',
  file_laporan VARCHAR(255),
  file_data_pendukung JSON,
  penanggung_jawab VARCHAR(255) NOT NULL DEFAULT 'Sekretaris',
  pelaksana VARCHAR(255) NOT NULL DEFAULT 'Bidang Ketersediaan',
  is_sensitive VARCHAR(100) CHECK(is_sensitive IN ('Biasa', 'Sensitif')) NOT NULL DEFAULT 'Biasa',
  status VARCHAR(100) CHECK(status IN ('draft', 'review', 'final')) NOT NULL DEFAULT 'draft',
  keterangan TEXT,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sek_lkt_layanan_id ON sek_lkt(layanan_id);
CREATE INDEX IF NOT EXISTS idx_sek_lkt_status ON sek_lkt(status);
CREATE INDEX IF NOT EXISTS idx_sek_lkt_created_at ON sek_lkt(created_at);

