-- =====================================================
-- SA06 - Audit Trail (audit_log)
-- Created: 2026-02-27
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  username VARCHAR(100),
  role VARCHAR(100),
  action VARCHAR(50),
  module VARCHAR(100),
  record_id INTEGER,
  old_value TEXT,
  new_value TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  is_bypass BOOLEAN DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_module ON audit_log(module);
