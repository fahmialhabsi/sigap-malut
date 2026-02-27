-- =====================================================
-- SA02 - Dynamic Module Generator (dynamic_modules)
-- Created: 2026-02-27
-- =====================================================

CREATE TABLE IF NOT EXISTS dynamic_modules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  module_id VARCHAR(50) NOT NULL,
  module_name VARCHAR(255) NOT NULL,
  table_name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  category VARCHAR(100),
  fields_definition TEXT,
  permissions TEXT,
  print_template VARCHAR(50),
  status VARCHAR(50) DEFAULT 'draft',
  generated_at TIMESTAMP,
  created_by INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_dynamic_module_id ON dynamic_modules(module_id);
