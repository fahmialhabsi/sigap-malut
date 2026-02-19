-- =====================================================
-- TABLE: komoditas
-- MODULE: M032 (Data Komoditas Pangan)
-- Generated: 2026-02-18T00:00:00.000Z
-- =====================================================

CREATE TABLE IF NOT EXISTS komoditas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kode VARCHAR(20) UNIQUE NOT NULL,
  nama VARCHAR(255) NOT NULL,
  kategori VARCHAR(20) CHECK(kategori IN ('pangan_pokok', 'pangan_strategis', 'pangan_lokal')) DEFAULT 'pangan_pokok',
  satuan VARCHAR(20) DEFAULT 'kg',
  is_active BOOLEAN DEFAULT 1,
  deskripsi TEXT,
  created_by INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_komoditas_kode ON komoditas(kode);
CREATE INDEX IF NOT EXISTS idx_komoditas_kategori ON komoditas(kategori);
CREATE INDEX IF NOT EXISTS idx_komoditas_active ON komoditas(is_active);
