-- =====================================================
-- SA09 - Dashboard Compliance (compliance_tracking)
-- Created: 2026-02-27
-- =====================================================

CREATE TABLE IF NOT EXISTS compliance_tracking (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  periode DATE NOT NULL,
  total_transactions INTEGER NOT NULL DEFAULT 0,
  bypass_count INTEGER NOT NULL DEFAULT 0,
  bypass_percentage REAL NOT NULL DEFAULT 0,
  compliance_percentage REAL NOT NULL DEFAULT 100,
  target_compliance REAL NOT NULL DEFAULT 100,
  status VARCHAR(50) NOT NULL DEFAULT 'on_target',
  bypass_details TEXT,
  top_violators TEXT,
  remedial_actions TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_compliance_periode ON compliance_tracking(periode);
CREATE INDEX IF NOT EXISTS idx_compliance_status ON compliance_tracking(status);
