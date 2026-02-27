-- =====================================================
-- SA01 - KPI Tracking (kpi_tracking)
-- Created: 2026-02-27
-- =====================================================

CREATE TABLE IF NOT EXISTS kpi_tracking (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kpi_code VARCHAR(20) NOT NULL,
  kpi_name VARCHAR(255) NOT NULL,
  kategori VARCHAR(100),
  target_value REAL,
  target_unit VARCHAR(50),
  current_value REAL DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  periode DATE,
  penanggung_jawab VARCHAR(255),
  cara_pengukuran TEXT,
  is_active BOOLEAN NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_kpi_kode ON kpi_tracking(kpi_code);
CREATE INDEX IF NOT EXISTS idx_kpi_periode ON kpi_tracking(periode);
