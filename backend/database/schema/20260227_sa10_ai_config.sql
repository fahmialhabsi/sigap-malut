-- =====================================================
-- SA10 - AI Configuration (ai_config)
-- Created: 2026-02-27
-- =====================================================

CREATE TABLE IF NOT EXISTS ai_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ai_service VARCHAR(50) NOT NULL DEFAULT 'openai',
  api_key VARCHAR(255),
  api_endpoint VARCHAR(255),
  model_name VARCHAR(100) NOT NULL DEFAULT 'gpt-4',
  temperature REAL NOT NULL DEFAULT 0.5,
  max_tokens INTEGER NOT NULL DEFAULT 1000,
  features_enabled TEXT,
  classification_accuracy REAL,
  total_requests INTEGER NOT NULL DEFAULT 0,
  total_cost REAL NOT NULL DEFAULT 0,
  monthly_budget REAL NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT 1,
  last_health_check TIMESTAMP,
  updated_by INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ai_service ON ai_config(ai_service);
CREATE INDEX IF NOT EXISTS idx_ai_model ON ai_config(model_name);
