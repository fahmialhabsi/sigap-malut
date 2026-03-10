-- Create roles table with all required columns
CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL UNIQUE,
  code VARCHAR(100) UNIQUE,
  level INTEGER NOT NULL UNIQUE,
  description TEXT,
  default_permissions JSON,
  is_active BOOLEAN NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create index for role code lookup (used in login)
CREATE INDEX IF NOT EXISTS idx_roles_code ON roles(code);

-- Seed canonical roles from roleSeeder specification (15 roles with unique levels)
INSERT OR IGNORE INTO roles (id, code, name, level, description, default_permissions, is_active, created_at, updated_at) VALUES
('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'kepala_dinas', 'Kepala Dinas', 1, 'Pemegang otoritas tertinggi di Dinas Pangan; memiliki hak approve akhir untuk workflow strategis.', '["approve:kgb","approve:kepegawaian","finalize:kgb","finalize:kepegawaian","read:compliance_reports","read:audit_log","manage:governance_settings"]', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('a47ac10b-58cc-4372-a567-0e02b2c3d480', 'sekretaris', 'Sekretaris', 2, 'Koordinator operasional internal; filter/koordinator alur staf ke Kepala Dinas.', '["create:kgb","read:kgb","update:kgb","delete:kgb","create:kepegawaian","read:kepegawaian","update:kepegawaian","delete:kepegawaian","approve:staff_level","finalize:administration","manage:administration_records"]', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b47ac10b-58cc-4372-a567-0e02b2c3d481', 'kepala_bidang', 'Kepala Bidang', 3, 'Pemimpin tiap bidang teknis; reviewer dan approver untuk layanan bidang.', '["create:distribusi","read:distribusi","update:distribusi","delete:distribusi","finalize:distribusi","create:konsumsi","read:konsumsi","update:konsumsi","delete:konsumsi","finalize:konsumsi","approve:field_requests"]', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('c47ac10b-58cc-4372-a567-0e02b2c3d482', 'kepala_uptd', 'Kepala UPTD', 4, 'Penanggung jawab UPTD; dapat approve permintaan UPTD.', '["create:uptd","read:uptd","update:uptd","delete:uptd","approve:uptd_requests","finalize:uptd"]', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('d47ac10b-58cc-4372-a567-0e02b2c3d483', 'atasan', 'Atasan Langsung', 5, 'Peran generik untuk atasan langsung yang mengajukan/menilai tugas bawahan.', '["approve:direct_reports","read:direct_reports"]', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('e47ac10b-58cc-4372-a567-0e02b2c3d484', 'staf', 'Staf', 6, 'Pengguna level staf; dapat membuat permohonan dan melihat data sendiri.', '["create:kgb_request","read:own_records","read:kgb"]', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('f47ac10b-58cc-4372-a567-0e02b2c3d485', 'pelaksana', 'Pelaksana', 7, 'Pelaksana teknis di bidang; peran operasional pada workflow stok/komoditas.', '["create:stok_records","read:stok_records","update:stok_records"]', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('147ac10b-58cc-4372-a567-0e02b2c3d486', 'fungsional', 'Fungsional', 8, 'Jabatan fungsional teknis untuk analisis dan verifikasi.', '["analyze:data","verify:requests","read:field_data"]', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('247ac10b-58cc-4372-a567-0e02b2c3d487', 'bendahara', 'Bendahara', 9, 'Bertanggung jawab atas verifikasi pembayaran dan dokumen keuangan.', '["create:payments","read:financial_records","update:payments","delete:payments","verify:payments"]', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('347ac10b-58cc-4372-a567-0e02b2c3d488', 'data_steward', 'Data Steward', 10, 'Penanggung jawab master-data (SSOT), validasi referensi, mapping dan transformasi.', '["manage:master_data","approve:master_changes","read:master_data"]', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('447ac10b-58cc-4372-a567-0e02b2c3d489', 'sysadmin', 'System Administrator', 11, 'Operasional teknis: deploy, konfigurasi, integrasi, dan manajemen secrets.', '["manage:infrastructure","manage:integrations","manage:secrets","read:infrastructure_metrics"]', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('547ac10b-58cc-4372-a567-0e02b2c3d48a', 'auditor', 'Auditor', 12, 'Akses read-only ke audit trail dan laporan compliance untuk kepentingan audit SPIP/SPBE.', '["read:audit_log","read:compliance_reports"]', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('647ac10b-58cc-4372-a567-0e02b2c3d48b', 'kepala_subbagian', 'Kepala Subbagian', 13, 'Penanggung jawab subbagian tata usaha/administrasi; reviewer operasional pada level subbagian.', '["read:subbag_data","approve:subbag_requests"]', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('747ac10b-58cc-4372-a567-0e02b2c3d48c', 'kepala_seksi', 'Kepala Seksi', 14, 'Penanggung jawab seksi teknis; reviewer/validator untuk kegiatan seksi.', '["read:seksi_data","approve:seksi_requests"]', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('847ac10b-58cc-4372-a567-0e02b2c3d48d', 'devops', 'DevOps', 15, 'Operasional platform CI/CD dan runbook deployment; terkait pengelolaan infrastruktur aplikasi.', '["deploy:applications","manage:ci_cd","read:infrastructure_metrics"]', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Verify table created
-- SELECT COUNT(*) as role_count FROM roles;
