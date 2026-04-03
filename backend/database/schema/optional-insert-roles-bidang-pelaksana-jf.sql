-- Jalankan di PostgreSQL jika update user gagal: Role 'pelaksana_ketersediaan' tidak ditemukan di tabel roles
-- Setiap INSERT hanya menambah baris jika code belum ada; level = MAX(level)+1 per baris.

INSERT INTO roles (id, code, name, level, description, default_permissions, is_active, created_at, updated_at)
SELECT gen_random_uuid(), 'pelaksana_ketersediaan', 'Pelaksana Ketersediaan',
       (SELECT COALESCE(MAX(level), 0) + 1 FROM roles),
       'Pelaksana teknis bidang ketersediaan dan kerawanan pangan.', '[]'::json, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE code = 'pelaksana_ketersediaan');

INSERT INTO roles (id, code, name, level, description, default_permissions, is_active, created_at, updated_at)
SELECT gen_random_uuid(), 'pelaksana_distribusi', 'Pelaksana Distribusi',
       (SELECT COALESCE(MAX(level), 0) + 1 FROM roles),
       'Pelaksana teknis bidang distribusi pangan.', '[]'::json, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE code = 'pelaksana_distribusi');

INSERT INTO roles (id, code, name, level, description, default_permissions, is_active, created_at, updated_at)
SELECT gen_random_uuid(), 'pelaksana_konsumsi', 'Pelaksana Konsumsi',
       (SELECT COALESCE(MAX(level), 0) + 1 FROM roles),
       'Pelaksana teknis bidang konsumsi dan keamanan pangan.', '[]'::json, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE code = 'pelaksana_konsumsi');

INSERT INTO roles (id, code, name, level, description, default_permissions, is_active, created_at, updated_at)
SELECT gen_random_uuid(), 'fungsional_ketersediaan', 'Fungsional Ketersediaan',
       (SELECT COALESCE(MAX(level), 0) + 1 FROM roles),
       'Jabatan fungsional verifikasi/analisis bidang ketersediaan.', '[]'::json, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE code = 'fungsional_ketersediaan');

INSERT INTO roles (id, code, name, level, description, default_permissions, is_active, created_at, updated_at)
SELECT gen_random_uuid(), 'fungsional_distribusi', 'Fungsional Distribusi',
       (SELECT COALESCE(MAX(level), 0) + 1 FROM roles),
       'Jabatan fungsional verifikasi/analisis bidang distribusi.', '[]'::json, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE code = 'fungsional_distribusi');

INSERT INTO roles (id, code, name, level, description, default_permissions, is_active, created_at, updated_at)
SELECT gen_random_uuid(), 'fungsional_konsumsi', 'Fungsional Konsumsi',
       (SELECT COALESCE(MAX(level), 0) + 1 FROM roles),
       'Jabatan fungsional verifikasi/analisis bidang konsumsi.', '[]'::json, true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE code = 'fungsional_konsumsi');
