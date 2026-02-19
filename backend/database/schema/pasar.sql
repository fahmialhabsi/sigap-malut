-- =====================================================
-- TABLE: pasar
-- MODULE: M042 (Data Pasar)
-- Generated: 2026-02-18T00:00:00.000Z
-- =====================================================

CREATE TABLE IF NOT EXISTS pasar (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama VARCHAR(255) NOT NULL,
  kabupaten VARCHAR(100) NOT NULL,
  kecamatan VARCHAR(100),
  desa VARCHAR(100),
  alamat TEXT,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  pengelola VARCHAR(100),
  no_telepon VARCHAR(20),
  is_active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pasar_kabupaten ON pasar(kabupaten);
CREATE INDEX IF NOT EXISTS idx_pasar_nama ON pasar(nama);
