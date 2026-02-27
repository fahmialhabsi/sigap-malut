-- Migration: create layanan (service master), role, approval_log
PRAGMA foreign_keys = OFF;

CREATE TABLE IF NOT EXISTS layanan (
  id_layanan VARCHAR(64) PRIMARY KEY,
  kode_layanan VARCHAR(128),
  nama_layanan VARCHAR(255),
  modul_ui_id VARCHAR(128),
  bidang_penanggung_jawab VARCHAR(128),
  endpoints TEXT,
  schema_reference TEXT,
  created_at DATETIME DEFAULT (datetime('now')),
  updated_at DATETIME DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS role (
  id_role VARCHAR(64) PRIMARY KEY,
  role_key VARCHAR(128) UNIQUE,
  display_name VARCHAR(255),
  permissions TEXT,
  created_at DATETIME DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS approval_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  layanan_id VARCHAR(64),
  requester_id VARCHAR(64),
  reviewer_id VARCHAR(64),
  action VARCHAR(64),
  comment TEXT,
  status VARCHAR(64),
  created_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (layanan_id) REFERENCES layanan(id_layanan)
);

CREATE INDEX IF NOT EXISTS idx_approval_layanan_id ON approval_log(layanan_id);

PRAGMA foreign_keys = ON;
