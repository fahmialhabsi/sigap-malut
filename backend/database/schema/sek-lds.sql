-- =====================================================
-- TABLE: sek_lds
-- MODULE: SEK-LDS
-- Generated: 2026-02-17T19:24:46.433Z
-- =====================================================

CREATE TABLE IF NOT EXISTS sek_lds (
  id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
  layanan_id VARCHAR(10) NOT NULL DEFAULT 'LY049',
  periode DATE NOT NULL,
  tahun INTEGER NOT NULL,
  bulan INTEGER NOT NULL,
  rencana_distribusi DECIMAL(15,2),
  realisasi_distribusi DECIMAL(15,2),
  persentase_realisasi DECIMAL(5,2),
  inflasi_pangan_persen DECIMAL(5,2),
  target_inflasi_tpid DECIMAL(5,2) DEFAULT 2.50,
  status_inflasi VARCHAR(100) CHECK(status_inflasi IN ('On Target', 'Warning', 'Alert')),
  harga_stabil INTEGER,
  harga_naik INTEGER,
  harga_turun INTEGER,
  operasi_pasar_dilakukan INTEGER,
  volume_operasi_pasar DECIMAL(15,2),
  cppd_stok DECIMAL(15,2),
  cppd_pelepasan DECIMAL(15,2),
  cbp_bulog_stok DECIMAL(15,2),
  distribusi_antar_wilayah DECIMAL(15,2),
  analisis TEXT,
  kendala TEXT,
  rekomendasi TEXT,
  sumber_data VARCHAR(255) DEFAULT 'Bidang Distribusi & Cadangan Pangan',
  file_laporan VARCHAR(255),
  file_data_pendukung JSON,
  penanggung_jawab VARCHAR(255) NOT NULL DEFAULT 'Sekretaris',
  pelaksana VARCHAR(255) NOT NULL DEFAULT 'Bidang Distribusi',
  is_sensitive VARCHAR(100) CHECK(is_sensitive IN ('Biasa', 'Sensitif')) NOT NULL DEFAULT 'Biasa',
  status VARCHAR(100) CHECK(status IN ('draft', 'review', 'final')) NOT NULL DEFAULT 'draft',
  keterangan TEXT,
  created_by INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sek_lds_layanan_id ON sek_lds(layanan_id);
CREATE INDEX IF NOT EXISTS idx_sek_lds_status ON sek_lds(status);
CREATE INDEX IF NOT EXISTS idx_sek_lds_created_at ON sek_lds(created_at);

