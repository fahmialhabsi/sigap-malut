-- =====================================================
-- SA08 - Backup & Restore (backups)
-- Created: 2026-02-27
-- =====================================================

CREATE TABLE IF NOT EXISTS backups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  backup_type VARCHAR(50),
  backup_name VARCHAR(255),
  file_path VARCHAR(255),
  file_size INTEGER,
  compression VARCHAR(50),
  database_name VARCHAR(100),
  tables_included TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  error_message TEXT,
  backup_duration INTEGER,
  is_encrypted BOOLEAN DEFAULT 0,
  retention_days INTEGER DEFAULT 30,
  created_by INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_backups_status ON backups(status);
