-- =====================================================
-- MASTER DATA TABLES
-- =====================================================

-- Master Komoditas
CREATE TABLE IF NOT EXISTS master_komoditas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama VARCHAR(255) NOT NULL,
  kategori VARCHAR(100),
  satuan VARCHAR(50) NOT NULL DEFAULT 'Kg',
  is_strategis BOOLEAN NOT NULL DEFAULT 1,
  keterangan TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_komoditas_nama ON master_komoditas(nama);
CREATE INDEX IF NOT EXISTS idx_komoditas_kategori ON master_komoditas(kategori);

-- Master Kabupaten
CREATE TABLE IF NOT EXISTS master_kabupaten (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama VARCHAR(255) NOT NULL,
  kode VARCHAR(10) NOT NULL UNIQUE,
  ibu_kota VARCHAR(255),
  jumlah_kecamatan INTEGER,
  jumlah_desa INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_kabupaten_nama ON master_kabupaten(nama);
CREATE INDEX IF NOT EXISTS idx_kabupaten_kode ON master_kabupaten(kode);