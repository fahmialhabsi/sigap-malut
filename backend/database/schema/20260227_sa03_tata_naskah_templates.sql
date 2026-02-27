-- =====================================================
-- SA03 - Tata Naskah Templates (tata_naskah_templates)
-- Created: 2026-02-27
-- =====================================================

CREATE TABLE IF NOT EXISTS tata_naskah_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  template_code VARCHAR(50) NOT NULL,
  jenis_naskah VARCHAR(50),
  nama_template VARCHAR(255),
  deskripsi TEXT,
  kop_surat TEXT,
  template_content TEXT,
  footer TEXT,
  penandatangan_default VARCHAR(100),
  auto_numbering_format VARCHAR(100),
  placeholders TEXT,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT 1,
  created_by INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_template_code ON tata_naskah_templates(template_code);
