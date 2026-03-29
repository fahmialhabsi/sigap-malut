-- =====================================================
-- TABLE: sub_checklist_tugas
-- Alat bantu pribadi Pelaksana untuk memecah tugas besar
-- Tidak perlu diapprove Kasubag — murni personal productivity tool
-- (BAGIAN G — Prompt 10)
-- =====================================================

CREATE TABLE IF NOT EXISTS sub_checklist_tugas (
  id          SERIAL PRIMARY KEY,
  task_id     INTEGER NOT NULL,
  dibuat_oleh INTEGER NOT NULL,
  deskripsi   VARCHAR(255) NOT NULL,
  is_selesai  BOOLEAN NOT NULL DEFAULT FALSE,
  selesai_at  TIMESTAMP NULL,
  urutan      SMALLINT NOT NULL DEFAULT 0,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (task_id)     REFERENCES tasks(id)     ON DELETE CASCADE,
  FOREIGN KEY (dibuat_oleh) REFERENCES users(id)     ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sub_checklist_task_urutan
  ON sub_checklist_tugas (task_id, urutan);

CREATE INDEX IF NOT EXISTS idx_sub_checklist_dibuat_oleh
  ON sub_checklist_tugas (dibuat_oleh);

-- =====================================================
-- TABLE: user_hierarchy
-- Relasi atasan-bawahan untuk validasi submit tugas
-- dan adaptive dashboard (Kasubag vs JF sebagai atasan)
-- =====================================================

CREATE TABLE IF NOT EXISTS user_hierarchy (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER NOT NULL,         -- bawahan (Pelaksana)
  supervisor_id INTEGER,                 -- atasan langsung (Kasubag / JF)
  has_subordinate BOOLEAN NOT NULL DEFAULT FALSE,
  unit_kerja   VARCHAR(100),
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  UNIQUE (user_id),
  FOREIGN KEY (user_id)      REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (supervisor_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_user_hierarchy_supervisor
  ON user_hierarchy (supervisor_id);
