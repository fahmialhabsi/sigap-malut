-- =====================================================
-- SA04 - Repositori Peraturan (peraturan)
-- Created: 2026-02-27
-- =====================================================

CREATE TABLE IF NOT EXISTS peraturan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  jenis_peraturan VARCHAR(50),
  nomor_peraturan VARCHAR(100),
  tahun INTEGER,
  judul TEXT,
  ringkasan TEXT,
  file_path VARCHAR(255),
  file_size INTEGER,
  status VARCHAR(50) DEFAULT 'berlaku',
  tags TEXT,
  dicabut_oleh VARCHAR(255),
  mengubah VARCHAR(255),
  diubah_oleh VARCHAR(255),
  download_count INTEGER DEFAULT 0,
  uploaded_by INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_peraturan_nomor ON peraturan(nomor_peraturan);
