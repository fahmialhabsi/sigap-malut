-- =====================================================
-- SA07 - System Configuration (system_config)
-- Created: 2026-02-27
-- =====================================================

CREATE TABLE IF NOT EXISTS system_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  config_key VARCHAR(100) NOT NULL UNIQUE,
  config_value TEXT,
  config_type VARCHAR(50) DEFAULT 'string',
  category VARCHAR(50) DEFAULT 'general',
  label VARCHAR(255),
  description TEXT,
  is_editable BOOLEAN DEFAULT 1,
  is_sensitive BOOLEAN DEFAULT 0,
  validation_rule VARCHAR(255),
  default_value TEXT,
  updated_by INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_config_key ON system_config(config_key);
